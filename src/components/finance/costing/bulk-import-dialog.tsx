"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ScrollableDialogContent,
  ScrollableDialogHeader,
  ScrollableDialogBody,
  ScrollableDialogFooter,
} from "@/components/common/scrollable-dialog"
import { DialogTitle } from "@/components/ui/dialog"
import {
  bulkImportProductMasterRouting,
  downloadBulkProductRoutingTemplate,
  exportBulkProductRouting,
  validateBulkProductRoutingFile,
  getImportJob,
} from "@/services/finance/cost-import-api"
import {
  chunkExcelFile,
  BULK_ROUTING_CONFIG,
  type ChunkResult,
} from "@/lib/excel/chunked-importer"
import type { BulkValidationResult } from "@/types/finance/cost-import"

export interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// "validate" flow: upload → validating → validated → submitting → done
// "chunked" flow:  upload → parsing → ready → chunked_importing → chunked_done | chunked_failed
type Step =
  | "upload"
  | "validating" | "validated" | "submitting" | "done"
  | "parsing" | "ready" | "chunked_importing" | "chunked_done" | "chunked_failed"

interface ChunkStatus {
  index: number
  keyCount: number
  status: "pending" | "uploading" | "polling" | "done" | "partial" | "failed"
}

const VALIDATE_SIZE_LIMIT = 5 * 1024 * 1024 // 5 MB — matches server-side validate limit
const POLL_MS = 3_000
const MAX_POLL_ERRORS = 5

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const abortRef = useRef(false)

  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>("upload")
  const [validation, setValidation] = useState<BulkValidationResult | null>(null)
  const [expandedSheets, setExpandedSheets] = useState<Set<string>>(new Set())
  const [jobId, setJobId] = useState<number | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)

  // Chunked state
  const [parseStage, setParseStage] = useState("")
  const [parsed, setParsed] = useState<ChunkResult | null>(null)
  const [chunks, setChunks] = useState<ChunkStatus[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [totalInserted, setTotalInserted] = useState(0)
  const [failedChunks, setFailedChunks] = useState<number[]>([])

  function resetState() {
    abortRef.current = false
    setFile(null)
    setStep("upload")
    setValidation(null)
    setExpandedSheets(new Set())
    setJobId(null)
    setParsed(null)
    setChunks([])
    setCurrentIdx(0)
    setTotalInserted(0)
    setFailedChunks([])
    setParseStage("")
    if (fileRef.current) fileRef.current.value = ""
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open) resetState() }, [open])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setValidation(null)
    setStep("upload")
  }

  async function handleDownloadTemplate() {
    setTemplateLoading(true)
    try {
      await downloadBulkProductRoutingTemplate()
    } catch (e) {
      toast.error(`Template download failed: ${String(e)}`)
    } finally {
      setTemplateLoading(false)
    }
  }

  async function handleValidate() {
    if (!file) return
    setStep("validating")
    try {
      const result = await validateBulkProductRoutingFile(file)
      setValidation(result)
      setStep("validated")
    } catch (e) {
      toast.error(`Validation failed: ${String(e)}`)
      setStep("upload")
    }
  }

  async function handleImport() {
    if (!file) return
    setStep("submitting")
    try {
      const result = await bulkImportProductMasterRouting(file, "update")
      setJobId(result.jobId)
      setStep("done")
      toast.success(`Import queued — Job #${result.jobId}`)
    } catch (e) {
      toast.error(`Import failed: ${String(e)}`)
      setStep("validated")
    }
  }

  // ── Chunked import flow ────────────────────────────────────────────────────
  async function handleChunkedImport() {
    if (!file) return
    setStep("parsing")
    try {
      const result = await chunkExcelFile(file, BULK_ROUTING_CONFIG, setParseStage)
      setParsed(result)
      setChunks(result.chunks.map((c) => ({ index: c.index, keyCount: c.keyCount, status: "pending" })))
      setStep("ready")
    } catch (e) {
      toast.error(`Parse failed: ${String(e)}`)
      setStep("upload")
    }
  }

  async function startChunkedImport(fromChunk = 0) {
    if (!parsed) return
    abortRef.current = false
    setStep("chunked_importing")
    const failed: number[] = []

    for (let i = fromChunk; i < parsed.chunks.length; i++) {
      if (abortRef.current) break
      setCurrentIdx(i)
      updateChunk(i, "uploading")

      const chunk = parsed.chunks[i]
      const chunkFile = new File([chunk.blob], chunk.fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      let cJobId: number
      try {
        const res = await bulkImportProductMasterRouting(chunkFile, "update")
        cJobId = res.jobId
        updateChunk(i, "polling")
      } catch (e) {
        toast.error(`Chunk ${i + 1} upload failed: ${String(e)}`)
        updateChunk(i, "failed")
        failed.push(i)
        continue
      }

      let pollErrors = 0
      let done = false
      while (!abortRef.current && !done) {
        await new Promise<void>((r) => setTimeout(r, POLL_MS))
        try {
          const job = await getImportJob(cJobId)
          if (job.status === "DONE" || job.status === "PARTIAL" || job.status === "FAILED") {
            updateChunk(i, job.status !== "FAILED" ? (job.status === "DONE" ? "done" : "partial") : "failed")
            if (job.status !== "FAILED") setTotalInserted((n) => n + (job.success ?? 0))
            else failed.push(i)
            done = true
          }
        } catch {
          if (++pollErrors >= MAX_POLL_ERRORS) { updateChunk(i, "failed"); failed.push(i); done = true }
        }
      }
    }

    setFailedChunks(failed)
    setStep(failed.length === 0 ? "chunked_done" : "chunked_failed")
  }

  function updateChunk(index: number, status: ChunkStatus["status"]) {
    setChunks((prev) => prev.map((c) => (c.index === index ? { ...c, status } : c)))
  }

  function handleClose() {
    abortRef.current = true
    resetState()
    onOpenChange(false)
  }

  function toggleSheet(sheetName: string) {
    setExpandedSheets((prev) => {
      const next = new Set(prev)
      if (next.has(sheetName)) {
        next.delete(sheetName)
      } else {
        next.add(sheetName)
      }
      return next
    })
  }

  const hasErrors = validation?.sheets.some((s) => s.errorCount > 0) ?? false
  const isValidating = step === "validating"
  const isSubmitting = step === "submitting"
  const isDone = step === "done"
  const canImport = step === "validated" && !hasErrors && (validation?.isValid ?? false)
  const isChunkedFlow = ["parsing","ready","chunked_importing","chunked_done","chunked_failed"].includes(step)
  const fileTooLargeForValidate = (file?.size ?? 0) > VALIDATE_SIZE_LIMIT
  const doneCount = chunks.filter((c) => c.status === "done" || c.status === "partial").length
  const progressPct = parsed ? Math.round((doneCount / parsed.chunks.length) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <ScrollableDialogContent className="sm:max-w-[580px]">
        <ScrollableDialogHeader>
          <DialogTitle>Bulk Import — Product Master &amp; Routing</DialogTitle>
        </ScrollableDialogHeader>

        <ScrollableDialogBody className="space-y-4">
          {/* Template Download — hidden once job submitted */}
          {!isDone && (
            <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 shrink-0 text-green-600" />
                <div className="min-w-0">
                  <p className="font-medium">Import Template</p>
                  <p className="text-sm text-muted-foreground">
                    Download template Excel dengan 6 sheet yang diperlukan
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 self-end sm:self-auto"
                onClick={handleDownloadTemplate}
                disabled={templateLoading || isSubmitting}
              >
                {templateLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download
              </Button>
            </div>
          )}

          {/* File Upload — hidden once job submitted */}
          {!isDone && (
            <div className="space-y-2">
              <Label>Pilih File</Label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {file ? (
                  <div className="flex min-w-0 max-w-full items-center gap-2">
                    <FileSpreadsheet className="h-6 w-6 shrink-0 text-green-600" />
                    <span className="min-w-0 truncate font-medium">{file.name}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-center text-sm text-muted-foreground">
                      Klik untuk memilih atau drag &amp; drop file Excel
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Format: .xlsx
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Validating spinner */}
          {isValidating && (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memvalidasi file…
            </div>
          )}

          {/* Validation results table */}
          {validation && !isValidating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {validation.isValid ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                )}
                <span className="font-medium">
                  {validation.isValid
                    ? "File valid — siap diimport"
                    : "Validasi gagal — perbaiki error sebelum import"}
                </span>
              </div>

              <div className="max-h-64 overflow-auto rounded border">
                  <Table className="w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sheet</TableHead>
                        <TableHead className="w-10 text-right">Row</TableHead>
                        <TableHead className="w-14 text-right">Error</TableHead>
                        <TableHead className="w-16 text-right">Warning</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validation.sheets.map((sheet) => (
                        <React.Fragment key={sheet.sheetName}>
                          <TableRow
                            className={sheet.errorCount > 0 ? "bg-destructive/5" : undefined}
                          >
                            <TableCell className="truncate font-medium">{sheet.sheetName}</TableCell>
                            <TableCell className="text-right">{sheet.totalRows}</TableCell>
                            <TableCell className="text-right">
                              {sheet.errorCount > 0 ? (
                                <Badge variant="destructive" className="text-xs">
                                  {sheet.errorCount}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {sheet.warningCount > 0 ? (
                                <Badge variant="secondary" className="text-xs">
                                  {sheet.warningCount}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {sheet.sampleErrors.length > 0 && (
                                <button
                                  type="button"
                                  className="flex items-center text-muted-foreground hover:text-foreground"
                                  onClick={() => toggleSheet(sheet.sheetName)}
                                >
                                  {expandedSheets.has(sheet.sheetName) ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </TableCell>
                          </TableRow>

                          {/* Sample errors */}
                          {expandedSheets.has(sheet.sheetName) &&
                            sheet.sampleErrors.map((err, i) => (
                              <TableRow key={`${sheet.sheetName}-err-${i}`} className="bg-muted/30">
                                <TableCell
                                  colSpan={5}
                                  className="break-all py-1 pl-4 text-xs text-destructive"
                                >
                                  Row {err.rowNumber}{err.field ? ` [${err.field}]` : ""}: {err.message}
                                </TableCell>
                              </TableRow>
                            ))}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            </div>
          )}

          {/* Done (single-shot) */}
          {isDone && jobId !== null && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Import dijadwalkan sebagai Job #{jobId}. Notifikasi akan dikirim saat selesai.
            </div>
          )}

          {/* File too large warning */}
          {file && step === "upload" && fileTooLargeForValidate && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                File {(file.size / 1024 / 1024).toFixed(1)} MB melebihi batas validasi 5 MB.
                Gunakan <strong>Chunked Import</strong> untuk melanjutkan.
              </span>
            </div>
          )}

          {/* Chunked: parsing */}
          {step === "parsing" && (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Parsing file…</p>
                <p className="mt-1 text-sm text-muted-foreground">{parseStage}</p>
              </div>
            </div>
          )}

          {/* Chunked: ready */}
          {step === "ready" && parsed && (
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <p className="font-medium">File parsed</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-muted-foreground">Products</p><p className="font-medium">{parsed.totalKeys.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Total rows</p><p className="font-medium">{parsed.totalRows.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Chunks</p><p className="font-medium">{parsed.chunks.length}</p></div>
              </div>
              <p className="text-xs text-muted-foreground">
                ~{BULK_ROUTING_CONFIG.chunkSize} products per chunk · 6 sheets each
              </p>
              <div className="flex gap-2 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                If routing references intermediate products from other chunks, those rows
                will show as &quot;missing product&quot; warnings (non-fatal).
              </div>
            </div>
          )}

          {/* Chunked: importing */}
          {step === "chunked_importing" && parsed && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Chunk {currentIdx + 1} / {parsed.chunks.length}</span>
                <span className="text-muted-foreground">{totalInserted.toLocaleString()} rows imported</span>
              </div>
              <Progress value={progressPct} className="h-2" />
              <div className="max-h-24 overflow-y-auto rounded border p-2">
                <div className="flex flex-wrap gap-1.5">
                  {chunks.map((c) => <RoutingChunkBadge key={c.index} chunk={c} current={c.index === currentIdx} />)}
                </div>
              </div>
            </div>
          )}

          {/* Chunked: done */}
          {step === "chunked_done" && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Import complete — {totalInserted.toLocaleString()} rows imported
                </p>
                <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-green-700"
                  onClick={() => router.push("/finance/import-jobs")}>
                  View Import Jobs →
                </Button>
              </div>
            </div>
          )}

          {/* Chunked: failed */}
          {step === "chunked_failed" && (
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    {failedChunks.length} chunk{failedChunks.length > 1 ? "s" : ""} failed
                    {totalInserted > 0 && ` — ${totalInserted.toLocaleString()} rows already imported`}
                  </p>
                </div>
              </div>
              <div className="max-h-20 overflow-y-auto rounded border p-2">
                <div className="flex flex-wrap gap-1.5">
                  {chunks.map((c) => <RoutingChunkBadge key={c.index} chunk={c} current={false} />)}
                </div>
              </div>
            </div>
          )}
        </ScrollableDialogBody>

        <ScrollableDialogFooter>
          <Button variant="outline" onClick={handleClose}
            disabled={isSubmitting || step === "chunked_importing"}>
            {isDone || step === "chunked_done" || step === "chunked_failed" ? "Tutup" : "Batal"}
          </Button>

          {/* Validate flow buttons */}
          {file && step === "upload" && !fileTooLargeForValidate && (
            <Button variant="outline" onClick={() => void handleValidate()} disabled={isValidating}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Validasi
            </Button>
          )}
          {canImport && (
            <Button onClick={() => void handleImport()} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              {isSubmitting ? "Mengantri…" : "Import"}
            </Button>
          )}

          {/* Chunked flow buttons */}
          {file && step === "upload" && (
            <Button onClick={() => void handleChunkedImport()}>
              <Upload className="mr-2 h-4 w-4" />
              {fileTooLargeForValidate ? "Chunked Import" : "Import (Chunked)"}
            </Button>
          )}
          {step === "ready" && (
            <Button onClick={() => void startChunkedImport(0)}>
              <Upload className="mr-2 h-4 w-4" />
              Start ({parsed?.chunks.length} chunks)
            </Button>
          )}
          {step === "chunked_importing" && (
            <Button variant="outline" onClick={() => { abortRef.current = true }}>Stop</Button>
          )}
          {step === "chunked_failed" && failedChunks.length > 0 && (
            <Button onClick={() => void startChunkedImport(failedChunks[0])}>
              <Upload className="mr-2 h-4 w-4" />
              Retry chunk {(failedChunks[0] ?? 0) + 1}
            </Button>
          )}
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  )
}

/**
 * Standalone "Export All" button that queues an async bulk export job.
 */
export function BulkExportButton({
  productTypeCodes,
}: {
  productTypeCodes?: string[]
}) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const result = await exportBulkProductRouting({ productTypeCodes })
      toast.success(`Export queued — Job #${result.jobId}`)
    } catch (e) {
      toast.error(`Export failed: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="mr-2 h-4 w-4" />
      )}
      {loading ? "Exporting…" : "Export All"}
    </Button>
  )
}

function RoutingChunkBadge({ chunk, current }: { chunk: ChunkStatus; current: boolean }) {
  const color: Record<ChunkStatus["status"], string> = {
    pending:   "bg-muted text-muted-foreground",
    uploading: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    polling:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    done:      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    partial:   "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
    failed:    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  }
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${color[chunk.status]} ${current ? "ring-2 ring-primary" : ""}`}
      title={`Chunk ${chunk.index + 1}: ${chunk.keyCount} products — ${chunk.status}`}>
      {chunk.index + 1}
      {current && (chunk.status === "uploading" || chunk.status === "polling") && (
        <Loader2 className="ml-1 h-2.5 w-2.5 animate-spin" />
      )}
    </span>
  )
}

export type { BulkValidationResult }
