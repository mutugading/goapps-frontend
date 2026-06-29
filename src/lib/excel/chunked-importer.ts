/**
 * chunked-importer.ts — Generic browser-side Excel chunker.
 *
 * Uses a Web Worker (chunked-importer.worker.ts) to parse large Excel files
 * off the main thread so the UI stays responsive.
 *
 * ### Usage
 *
 * ```ts
 * import { chunkExcelFile, PARAMS_ONLY_CONFIG } from "@/lib/excel/chunked-importer"
 *
 * const result = await chunkExcelFile(file, PARAMS_ONLY_CONFIG, (stage) =>
 *   console.log(stage)
 * )
 * // result.chunks is ParsedChunk[] ready to upload
 * ```
 *
 * ### Adding a new import format
 *
 * Create a new `ChunkerConfig` constant — no code changes required:
 *
 * ```ts
 * export const MY_FORMAT_CONFIG: ChunkerConfig = {
 *   sheetGroups: [
 *     { baseName: "my_sheet", outputName: "my_sheet" },
 *   ],
 *   keyColumn: "my_id_column",
 *   chunkSize: 500,
 * }
 * ```
 */

export type { SheetGroupConfig } from "./chunked-importer.worker"

export interface ChunkerConfig {
  /** Sheet groups to parse and merge. */
  sheetGroups: import("./chunked-importer.worker").SheetGroupConfig[]
  /** Column name used to group rows per unique key (e.g. "legacy_oracle_sys_id"). */
  keyColumn: string
  /** Number of unique key values per output chunk. Default: 300. */
  chunkSize?: number
}

export interface ParsedChunk {
  index: number
  blob: Blob
  fileName: string
  /** Number of unique key values in this chunk. */
  keyCount: number
  rowCount: number
}

export interface ChunkResult {
  totalKeys: number
  totalRows: number
  chunks: ParsedChunk[]
}

// ── Built-in configurations ────────────────────────────────────────────────

/** Params-only import: product_parameters + product_applicable_params. */
export const PARAMS_ONLY_CONFIG: ChunkerConfig = {
  sheetGroups: [
    { baseName: "product_parameters",        outputName: "product_parameters" },
    { baseName: "product_applicable_params", outputName: "product_applicable_params" },
  ],
  keyColumn: "legacy_oracle_sys_id",
  chunkSize: 300,
}

/**
 * Bulk product + routing import (product_master + route sheets).
 *
 * route_sequences and route_rms use "route_head_legacy_id" as their key
 * column (same value as legacy_oracle_sys_id — the root product ID) so
 * they are split correctly alongside their parent product rows.
 *
 * ⚠ Cross-chunk caveat: if product A's routing references product B as an
 * intermediate node (node_product_legacy_id = B), and B is in a different
 * chunk, the import will log B as "missing from product_master sheet" for
 * that chunk but will NOT fail — it treats it as a skip (product B must
 * already exist in the database from a previous import or earlier chunk).
 */
export const BULK_ROUTING_CONFIG: ChunkerConfig = {
  sheetGroups: [
    { baseName: "product_master",            outputName: "product_master" },
    { baseName: "product_parameters",        outputName: "product_parameters" },
    { baseName: "product_applicable_params", outputName: "product_applicable_params" },
    { baseName: "route_head",                outputName: "route_head" },
    { baseName: "route_sequences",           outputName: "route_sequences", keyColumn: "route_head_legacy_id" },
    { baseName: "route_rms",                 outputName: "route_rms",       keyColumn: "route_head_legacy_id" },
  ],
  keyColumn: "legacy_oracle_sys_id", // default for product_master, params, route_head
  chunkSize: 200,
}

// ── Core function ──────────────────────────────────────────────────────────

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

/**
 * Parse an Excel file using a Web Worker and split into upload-ready chunks.
 *
 * @param file         The Excel file selected by the user.
 * @param config       Which sheets to parse, which column is the key, chunk size.
 * @param onProgress   Optional callback for stage strings ("Parsing…", "Indexing…").
 * @returns            Resolved when all chunks are built; rejects on parse error.
 */
export function chunkExcelFile(
  file: File,
  config: ChunkerConfig,
  onProgress?: (stage: string) => void
): Promise<ChunkResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./chunked-importer.worker", import.meta.url)
    )

    const chunks: ParsedChunk[] = []
    let totalKeys = 0
    let totalRows = 0
    let expectedChunks = 0

    worker.onmessage = (e: MessageEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const msg = e.data

      switch (msg.type) {
        case "progress":
          onProgress?.(msg.stage as string)
          break

        case "ready":
          totalKeys = msg.totalKeys as number
          totalRows = msg.totalRows as number
          expectedChunks = msg.totalChunks as number
          onProgress?.(`Building chunks (0/${expectedChunks})…`)
          worker.postMessage({ type: "next" })
          break

        case "chunk": {
          const blob = new Blob([msg.buffer as ArrayBuffer], { type: XLSX_MIME })
          chunks.push({
            index: msg.index as number,
            blob,
            fileName: msg.fileName as string,
            keyCount: msg.keyCount as number,
            rowCount: msg.rowCount as number,
          })
          onProgress?.(`Building chunks (${chunks.length}/${expectedChunks})…`)
          worker.postMessage({ type: "next" })
          break
        }

        case "done":
          worker.terminate()
          resolve({ totalKeys, totalRows, chunks })
          break

        case "error":
          worker.terminate()
          reject(new Error(msg.message as string))
          break
      }
    }

    worker.onerror = (err) => {
      worker.terminate()
      reject(new Error(`Worker error: ${err.message}`))
    }

    // Transfer the ArrayBuffer — zero-copy, buffer is detached in main thread.
    file.arrayBuffer().then((buffer) => {
      worker.postMessage(
        {
          type: "start",
          buffer,
          keyColumn: config.keyColumn,
          sheetGroups: config.sheetGroups,
          chunkSize: config.chunkSize ?? 300,
          baseName: file.name.replace(/\.xlsx?$/i, ""),
        },
        [buffer]
      )
    }).catch(reject)
  })
}
