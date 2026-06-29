/**
 * chunked-importer.worker.ts — Generic Web Worker for chunking any Excel import file.
 *
 * Accepts a flexible SheetGroupConfig so the same worker binary handles any
 * import format: params-only, product-routing, RM pricing, etc.
 *
 * Protocol (all messages are structured-cloneable):
 *
 *   Main → Worker  StartMessage   — start parsing
 *   Worker → Main  ProgressMsg    — stage updates (multiple)
 *   Worker → Main  ReadyMsg       — parsing done; N chunks ready
 *   Main → Worker  NextMessage    — request next chunk
 *   Worker → Main  ChunkMsg       — one chunk (ArrayBuffer transferred, zero-copy)
 *   Worker → Main  DoneMsg        — all chunks sent
 *   Worker → Main  ErrorMsg       — fatal error
 */
import * as XLSX from "xlsx"

// ── Public message types (re-exported via chunked-importer.ts) ─────────────

export interface SheetGroupConfig {
  /** Base name to match — exact match wins, otherwise contains-match (case-insensitive). */
  baseName: string
  /** Sheet name written into each output chunk file. */
  outputName: string
}

export interface StartMessage {
  type: "start"
  /** Raw ArrayBuffer of the .xlsx file — transferred (zero-copy). */
  buffer: ArrayBuffer
  /** Column name used to group rows into per-key-value buckets. */
  keyColumn: string
  /** Sheet groups to parse and merge. */
  sheetGroups: SheetGroupConfig[]
  /** Number of unique key values per chunk. */
  chunkSize: number
  /** Stem used to generate chunk file names (e.g. "params_2026"). */
  baseName: string
}

export interface NextMessage {
  type: "next"
}

export interface ProgressMsg {
  type: "progress"
  stage: string
}

export interface ReadyMsg {
  type: "ready"
  totalKeys: number
  totalRows: number
  totalChunks: number
}

export interface ChunkMsg {
  type: "chunk"
  index: number
  total: number
  /** Transferred ArrayBuffer — detached from worker heap after postMessage. */
  buffer: ArrayBuffer
  fileName: string
  keyCount: number
  rowCount: number
}

export interface DoneMsg {
  type: "done"
}

export interface ErrorMsg {
  type: "error"
  message: string
}

export type WorkerOutMsg = ProgressMsg | ReadyMsg | ChunkMsg | DoneMsg | ErrorMsg
type WorkerInMsg = StartMessage | NextMessage

// ── Internal state ─────────────────────────────────────────────────────────

interface ParsedGroup {
  headers: unknown[]
  rowsByKey: Map<string, unknown[][]>
  outputName: string
}

let groups: ParsedGroup[] = []
let masterKeys: string[] = []
let currentChunkSize = 300
let currentBaseName = ""
let remaining: number[] = [] // chunk indices yet to be sent

// ── Message handler ────────────────────────────────────────────────────────

self.onmessage = (e: MessageEvent<WorkerInMsg>) => {
  if (e.data.type === "start") {
    handleStart(e.data).catch((err: unknown) => {
      emit({ type: "error", message: String(err) })
    })
  } else if (e.data.type === "next") {
    sendNextChunk()
  }
}

// ── Parse ──────────────────────────────────────────────────────────────────

async function handleStart(msg: StartMessage) {
  currentChunkSize = msg.chunkSize
  currentBaseName = msg.baseName
  groups = []
  masterKeys = []

  emit({ type: "progress", stage: "Parsing Excel file… (please wait)" })

  const wb = XLSX.read(new Uint8Array(msg.buffer), { type: "array", dense: true })

  const keySet = new Set<string>()
  let grandTotal = 0

  for (const groupCfg of msg.sheetGroups) {
    emit({ type: "progress", stage: `Indexing "${groupCfg.baseName}"…` })

    const matching = findMatchingSheets(wb, groupCfg.baseName)
    if (matching.length === 0) continue

    let headers: unknown[] = []
    let keyColIdx = -1
    const rowsByKey = new Map<string, unknown[][]>()

    for (let si = 0; si < matching.length; si++) {
      const ws = wb.Sheets[matching[si]]
      const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null })

      if (si === 0) {
        headers = (rows[0] as (string | null)[]).map((h) =>
          h != null ? String(h).trim() : ""
        )
        keyColIdx = (headers as string[]).indexOf(msg.keyColumn)
        if (keyColIdx === -1) {
          emit({
            type: "error",
            message: `Sheet "${matching[0]}" does not contain required key column "${msg.keyColumn}". Found: ${headers.filter(Boolean).join(", ")}`,
          })
          return
        }
      }

      const startRow = si === 0 ? 1 : 1 // skip header in all sheets
      for (let r = startRow; r < rows.length; r++) {
        const row = rows[r] as unknown[]
        if (!row || row.every((v) => v == null || v === "")) continue
        const rawKey = row[keyColIdx]
        if (rawKey == null || rawKey === "") continue
        const key = String(rawKey).trim()
        if (!rowsByKey.has(key)) rowsByKey.set(key, [])
        rowsByKey.get(key)!.push(row)
        grandTotal++
        if (!keySet.has(key)) {
          keySet.add(key)
          masterKeys.push(key)
        }
      }
    }

    groups.push({ headers, rowsByKey, outputName: groupCfg.outputName })
  }

  if (groups.length === 0) {
    emit({ type: "error", message: "No matching sheets found. Check sheet names." })
    return
  }

  const totalChunks = Math.ceil(masterKeys.length / currentChunkSize)
  remaining = Array.from({ length: totalChunks }, (_, i) => i)

  emit({
    type: "ready",
    totalKeys: masterKeys.length,
    totalRows: grandTotal,
    totalChunks,
  })
}

// ── Chunk generation ───────────────────────────────────────────────────────

function sendNextChunk() {
  if (remaining.length === 0) {
    emit({ type: "done" })
    return
  }

  const idx = remaining.shift()!
  const start = idx * currentChunkSize
  const batchKeys = masterKeys.slice(start, start + currentChunkSize)
  const total = Math.ceil(masterKeys.length / currentChunkSize)

  const chunkWb = XLSX.utils.book_new()
  let chunkRows = 0

  for (const group of groups) {
    const data: unknown[][] = [group.headers]
    for (const key of batchKeys) {
      const rows = group.rowsByKey.get(key) ?? []
      data.push(...rows)
      chunkRows += rows.length
    }
    XLSX.utils.book_append_sheet(chunkWb, XLSX.utils.aoa_to_sheet(data), group.outputName)
  }

  const rawArr = XLSX.write(chunkWb, {
    type: "array",
    bookType: "xlsx",
    compression: true,
  }) as number[]

  // Copy into a plain ArrayBuffer so it is transferable (zero-copy to main thread).
  const ab = new Uint8Array(rawArr).buffer as ArrayBuffer

  const msg: ChunkMsg = {
    type: "chunk",
    index: idx,
    total,
    buffer: ab,
    fileName: `${currentBaseName}_chunk_${String(idx + 1).padStart(3, "0")}.xlsx`,
    keyCount: batchKeys.length,
    rowCount: chunkRows,
  }

  // Transfer ab — removed from worker heap, no copy on the wire.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(self as any).postMessage(msg, [ab])
}

// ── Helpers ────────────────────────────────────────────────────────────────

function findMatchingSheets(wb: XLSX.WorkBook, baseName: string): string[] {
  const lower = baseName.toLowerCase()
  const exact = wb.SheetNames.filter((n) => n === baseName)
  if (exact.length > 0) {
    // Include the exact match PLUS any continuation sheets (e.g. "params_2")
    const extras = wb.SheetNames.filter(
      (n) => n !== baseName && n.toLowerCase().includes(lower)
    ).sort()
    return [...exact, ...extras]
  }
  return wb.SheetNames.filter((n) => n.toLowerCase().includes(lower)).sort()
}

function emit(msg: WorkerOutMsg) {
  self.postMessage(msg)
}
