/**
 * params-chunker.ts — Browser-side chunker for bulk_params_only Excel files.
 *
 * Reads the file with SheetJS, groups rows by legacy_oracle_sys_id, and
 * splits into small per-product-batch Blob objects that can be uploaded
 * sequentially without overwhelming the finance-worker's memory or causing
 * long DB transactions that drop with "unexpected EOF".
 *
 * Supports split part-sheets:
 *   product_parameters   + product_parameters_2
 *   product_applicable_params + product_applicable_params_2
 * — all matching sheets are merged before chunking.
 */
import * as XLSX from "xlsx"

export const DEFAULT_CHUNK_SIZE = 300 // products per chunk → ~60–90K rows

export interface ParsedChunk {
  index: number // 0-based
  blob: Blob
  fileName: string
  productCount: number
  rowCount: number
}

export interface ParseResult {
  totalProducts: number
  totalRows: number
  chunks: ParsedChunk[]
}

// Logical sheet groups: key = output sheet name in chunk files
const SHEET_GROUPS = [
  "product_parameters",
  "product_applicable_params",
] as const

const LEGACY_ID_COL = "legacy_oracle_sys_id"

/** Parse a params-only Excel file and return pre-built chunk Blobs. */
export async function parseAndChunkParamsFile(
  file: File,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  onProgress?: (stage: string) => void
): Promise<ParseResult> {
  onProgress?.("Reading file…")

  const ab = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(ab), { type: "array", dense: true })

  // For each logical sheet group, find all matching sheets (exact + _2, _p2, …)
  // and merge their data rows into a single structure keyed by product ID.
  const groupData = new Map<
    string, // output sheet name
    { headers: string[]; rowsByProduct: Map<string, unknown[][]> }
  >()

  let grandTotalRows = 0
  const masterProductIds: string[] = []
  const productIdSet = new Set<string>()

  for (const base of SHEET_GROUPS) {
    onProgress?.(`Parsing ${base}…`)

    const matchingNames = wb.SheetNames.filter(
      (n) => n === base || n.toLowerCase().includes(base.toLowerCase())
    ).sort()

    if (matchingNames.length === 0) continue

    let headers: string[] = []
    let legacyColIdx = -1
    const rowsByProduct = new Map<string, unknown[][]>()

    for (let si = 0; si < matchingNames.length; si++) {
      const ws = wb.Sheets[matchingNames[si]]
      const allRows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
        header: 1,
        defval: null,
      })

      const startRow = si === 0 ? 0 : 1 // skip header in continuation sheets

      if (si === 0) {
        headers = (allRows[0] as string[]).map((h) =>
          h != null ? String(h).trim() : ""
        )
        legacyColIdx = headers.indexOf(LEGACY_ID_COL)
        if (legacyColIdx === -1) {
          throw new Error(
            `Sheet "${matchingNames[0]}" is missing required header "${LEGACY_ID_COL}"`
          )
        }
      }

      for (let r = startRow; r < allRows.length; r++) {
        const row = allRows[r] as unknown[]
        if (!row || row.every((v) => v == null || v === "")) continue
        const rawId = row[legacyColIdx]
        if (rawId == null || rawId === "") continue
        const id = String(rawId).trim()
        if (!rowsByProduct.has(id)) rowsByProduct.set(id, [])
        rowsByProduct.get(id)!.push(row)
        grandTotalRows++

        if (!productIdSet.has(id)) {
          productIdSet.add(id)
          masterProductIds.push(id)
        }
      }
    }

    groupData.set(base, { headers, rowsByProduct })
  }

  onProgress?.(`Splitting ${masterProductIds.length} products into chunks…`)

  const chunks: ParsedChunk[] = []
  const baseName = file.name.replace(/\.xlsx?$/i, "")

  for (let i = 0; i < masterProductIds.length; i += chunkSize) {
    const batchIds = masterProductIds.slice(i, i + chunkSize)
    const chunkWb = XLSX.utils.book_new()
    let chunkRows = 0

    for (const [sheetName, { headers, rowsByProduct }] of groupData.entries()) {
      const data: unknown[][] = [headers]
      for (const id of batchIds) {
        const productRows = rowsByProduct.get(id) ?? []
        data.push(...productRows)
        chunkRows += productRows.length
      }
      XLSX.utils.book_append_sheet(chunkWb, XLSX.utils.aoa_to_sheet(data), sheetName)
    }

    // XLSX.write with type:"array" returns a plain JS Array, not a typed array.
    // Converting via Uint8Array avoids SharedArrayBuffer/ArrayBuffer ambiguity.
    const rawBuffer = XLSX.write(chunkWb, {
      type: "array",
      bookType: "xlsx",
      compression: true,
    }) as number[]
    const uint8 = new Uint8Array(rawBuffer)

    const chunkIndex = chunks.length
    const fileName = `${baseName}_chunk_${String(chunkIndex + 1).padStart(3, "0")}.xlsx`

    chunks.push({
      index: chunkIndex,
      blob: new Blob([uint8], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      fileName,
      productCount: batchIds.length,
      rowCount: chunkRows,
    })
  }

  return {
    totalProducts: masterProductIds.length,
    totalRows: grandTotalRows,
    chunks,
  }
}
