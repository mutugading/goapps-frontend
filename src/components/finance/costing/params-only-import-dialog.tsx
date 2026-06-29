"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  bulkImportParamsOnly,
  downloadParamsOnlyTemplate,
  getImportJob,
} from "@/services/finance/cost-import-api"
import {
  chunkExcelFile,
  PARAMS_ONLY_CONFIG,
  type ChunkResult,
} from "@/lib/excel/chunked-importer"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "upload" | "parsing" | "ready" | "importing" | "done" | "failed"

interface ChunkStatus {
  index: number
  productCount: number
  rowCount: number
  status: "pending" | "uploading" | "polling" | "done" | "partial" | "failed"
  jobId?: number
  inserted?: number
}

const POLL_MS = 3_000
const MAX_POLL_ERRORS = 5
// For params-only, a PARTIAL result means some products were skipped (not yet in DB).
// Auto-retry lets subsequent passes pick up those products once routing is complete.
const MAX_AUTO_PASSES = 3

export function ParamsOnlyImportDialog({ open, onOpenChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const abortRef = useRef(false)

  const [file, setFile] = useState<File | null>(null)
  const [parseStage, setParseStage] = useState("")
  const [parsed, setParsed] = useState<ChunkResult | null>(null)
  const [step, setStep] = useState<Step>("upload")
  const [chunks, setChunks] = useState<ChunkStatus[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [totalInserted, setTotalInserted] = useState(0)
  const [failedChunks, setFailedChunks] = useState<number[]>([])
  const [templateLoading, setTemplateLoading] = useState(false)
  const [passNum, setPassNum] = useState(1)
  const [passStatus, setPassStatus] = useState("")

  useEffect(() => {
    if (open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function reset() {
    abortRef.current = false
    setFile(null)
    setParsed(null)
    setStep("upload")
    setChunks([])
    setCurrentIdx(0)
    setTotalInserted(0)
    setFailedChunks([])
    setPassNum(1)
    setPassStatus("")
    setParseStage("")
    if (fileRef.current) fileRef.current.value = ""
  }

  async function handleParse(f: File) {
    setFile(f)
    setStep("parsing")
    try {
      const result = await chunkExcelFile(f, PARAMS_ONLY_CONFIG, setParseStage)
      setParsed(result)
      setChunks(
        result.chunks.map((c) => ({
          index: c.index,
          productCount: c.keyCount,
          rowCount: c.rowCount,
          status: "pending",
        }))
      )
      setStep("ready")
    } catch (e) {
      toast.error(`Failed to parse file: ${String(e)}`)
      setStep("upload")
    }
  }

  async function startImport(fromChunk = 0) {
    if (!parsed) return
    abortRef.current = false
    setStep("importing")

    let prevFailedCount = parsed.chunks.length
    let currentPass = fromChunk === 0 ? 1 : passNum

    // eslint-disable-next-line no-constant-condition
    while (true) {
      setPassNum(currentPass)
      setPassStatus(currentPass > 1 ? `Pass ${currentPass}/${MAX_AUTO_PASSES} — retrying ${prevFailedCount} failed chunks…` : "")

      if (currentPass > 1) {
        setChunks((prev) => prev.map((c) => ({ ...c, status: c.status === "failed" ? "pending" : c.status })))
      }

      const failed: number[] = []

      for (let i = fromChunk; i < parsed.chunks.length; i++) {
        if (abortRef.current) break
        if (currentPass > 1) {
          const cur = chunks.find((c) => c.index === i)
          if (cur && (cur.status === "done" || cur.status === "partial")) continue
        }
        setCurrentIdx(i)
        updateChunk(i, { status: "uploading" })

        const chunk = parsed.chunks[i]
        const chunkFile = new File([chunk.blob], chunk.fileName, {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })

        let jobId: number
        try {
          const res = await bulkImportParamsOnly(chunkFile)
          jobId = res.jobId
          updateChunk(i, { status: "polling", jobId })
        } catch (e) {
          toast.error(`Chunk ${i + 1} upload failed: ${String(e)}`)
          updateChunk(i, { status: "failed" })
          failed.push(i)
          continue
        }

        let pollErrors = 0
        let done = false
        while (!abortRef.current && !done) {
          await delay(POLL_MS)
          try {
            const job = await getImportJob(jobId)
            if (job.status === "DONE" || job.status === "PARTIAL" || job.status === "FAILED") {
              const ok = job.status !== "FAILED"
              updateChunk(i, {
                status: ok ? (job.status === "DONE" ? "done" : "partial") : "failed",
                inserted: job.success,
              })
              if (ok) setTotalInserted((n) => n + (job.success ?? 0))
              else failed.push(i)
              done = true
            }
          } catch {
            pollErrors++
            if (pollErrors >= MAX_POLL_ERRORS) {
              updateChunk(i, { status: "failed" })
              failed.push(i)
              done = true
            }
          }
        }
      }

      setFailedChunks(failed)

      if (abortRef.current || failed.length === 0) break
      if (currentPass >= MAX_AUTO_PASSES) break
      if (failed.length >= prevFailedCount) {
        setPassStatus(`Stopped after ${currentPass} passes — ${failed.length} chunks could not be resolved`)
        break
      }

      prevFailedCount = failed.length
      currentPass++
      fromChunk = 0
    }

    const finalFailed = chunks.filter((c) => c.status === "failed").length
    setStep(finalFailed === 0 ? "done" : "failed")
  }

  function updateChunk(index: number, patch: Partial<ChunkStatus>) {
    setChunks((prev) =>
      prev.map((c) => (c.index === index ? { ...c, ...patch } : c))
    )
  }

  const doneCount = chunks.filter((c) => c.status === "done" || c.status === "partial").length
  const progressPct = parsed ? Math.round((doneCount / parsed.chunks.length) * 100) : 0

  async function handleTemplate() {
    setTemplateLoading(true)
    try { await downloadParamsOnlyTemplate() }
    catch (e) { toast.error(`Template download failed: ${String(e)}`) }
    finally { setTemplateLoading(false) }
  }

  function handleClose() {
    abortRef.current = true
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Import Params Only (Bulk)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">

          {/* Upload */}
          {step === "upload" && (
            <>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">Params-Only Template</p>
                    <p className="text-sm text-muted-foreground">
                      product_parameters + product_applicable_params
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => void handleTemplate()} disabled={templateLoading}>
                  {templateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  Template
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Select file</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50"
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleParse(f) }} />
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to select — any size</p>
                  <p className="text-xs text-muted-foreground">
                    File split automatically into {PARAMS_ONLY_CONFIG.chunkSize ?? 300}-product chunks
                  </p>
                </div>
              </div>

              <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Large files are split and uploaded chunk-by-chunk. Each chunk runs
                  independently — failed chunks can be retried without restarting.
                </span>
              </div>
            </>
          )}

          {/* Parsing */}
          {step === "parsing" && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium">Parsing file in browser…</p>
                <p className="mt-1 text-sm text-muted-foreground">{parseStage}</p>
                <p className="mt-1 text-xs text-muted-foreground">Large files may take 30–60 s</p>
              </div>
              {file && <p className="text-xs text-muted-foreground">{file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB</p>}
            </div>
          )}

          {/* Ready */}
          {step === "ready" && parsed && (
            <>
              <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
                <p className="font-medium">File parsed</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Products</p><p className="font-medium">{parsed.totalKeys.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground">Total rows</p><p className="font-medium">{parsed.totalRows.toLocaleString()}</p></div>
                  <div><p className="text-muted-foreground">Chunks</p><p className="font-medium">{parsed.chunks.length}</p></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  ~{PARAMS_ONLY_CONFIG.chunkSize ?? 300} products per chunk · ~{Math.round(parsed.totalRows / parsed.chunks.length).toLocaleString()} rows each · est. 3–8 min per chunk
                </p>
              </div>
              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Products must already exist from a prior bulk routing import.</span>
              </div>
            </>
          )}

          {/* Importing */}
          {step === "importing" && parsed && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {passNum > 1 ? `Pass ${passNum}/${MAX_AUTO_PASSES} · ` : ""}Chunk {currentIdx + 1} / {parsed.chunks.length}
                </span>
                <span className="text-muted-foreground">{totalInserted.toLocaleString()} rows imported</span>
              </div>
              <Progress value={progressPct} className="h-2" />
              {passStatus && <p className="text-xs text-muted-foreground">{passStatus}</p>}
              <p className="text-xs text-muted-foreground text-center">{doneCount}/{parsed.chunks.length} complete ({progressPct}%)</p>
              <div className="max-h-32 overflow-y-auto rounded border p-2">
                <div className="flex flex-wrap gap-1.5">
                  {chunks.map((c) => (
                    <ChunkBadge key={c.index} chunk={c} current={c.index === currentIdx} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Done */}
          {step === "done" && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Import complete — {totalInserted.toLocaleString()} rows imported
                </p>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  {parsed?.chunks.length} chunks processed
                  {chunks.filter((c) => c.status === "partial").length > 0 &&
                    ` · ${chunks.filter((c) => c.status === "partial").length} with partial errors`}
                </p>
                <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-green-700"
                  onClick={() => router.push("/finance/import-jobs")}>
                  View Import Jobs →
                </Button>
              </div>
            </div>
          )}

          {/* Failed */}
          {step === "failed" && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    {failedChunks.length} chunk{failedChunks.length > 1 ? "s" : ""} failed
                    {totalInserted > 0 && ` — ${totalInserted.toLocaleString()} rows already imported`}
                  </p>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                    Failed: chunks {failedChunks.map((i) => i + 1).join(", ")}
                  </p>
                </div>
              </div>
              <div className="max-h-28 overflow-y-auto rounded border p-2">
                <div className="flex flex-wrap gap-1.5">
                  {chunks.map((c) => <ChunkBadge key={c.index} chunk={c} current={false} />)}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {(step === "upload" || step === "done" || step === "failed") && (
            <Button variant="outline" onClick={handleClose}>
              {step === "done" || step === "failed" ? "Close" : "Cancel"}
            </Button>
          )}
          {step === "ready" && (
            <>
              <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
              <Button onClick={() => void startImport(0)}>
                <Upload className="mr-2 h-4 w-4" />
                Start import ({parsed?.chunks.length} chunks)
              </Button>
            </>
          )}
          {step === "importing" && (
            <Button variant="outline" onClick={() => { abortRef.current = true; toast.info("Stopping after current chunk…") }}>
              Stop
            </Button>
          )}
          {step === "failed" && failedChunks.length > 0 && (
            <Button onClick={() => void startImport(failedChunks[0])}>
              <Upload className="mr-2 h-4 w-4" />
              Retry from chunk {(failedChunks[0] ?? 0) + 1}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ChunkBadge({ chunk, current }: { chunk: ChunkStatus; current: boolean }) {
  const color: Record<ChunkStatus["status"], string> = {
    pending:   "bg-muted text-muted-foreground",
    uploading: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    polling:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
    done:      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    partial:   "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
    failed:    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  }
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${color[chunk.status]} ${current ? "ring-2 ring-primary" : ""}`}
      title={`Chunk ${chunk.index + 1}: ${chunk.productCount} products — ${chunk.status}`}
    >
      {chunk.index + 1}
      {current && (chunk.status === "uploading" || chunk.status === "polling") && (
        <Loader2 className="ml-1 h-2.5 w-2.5 animate-spin" />
      )}
    </span>
  )
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
