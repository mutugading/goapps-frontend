"use client"

import { useEffect, useRef, useState } from "react"
import {
  CheckCircle2,
  Download,
  ExternalLink,
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
import { StatusBadge } from "@/components/common/status-badge"
import {
  getImportUploadURL,
  putToPresignedUrl,
  startCostingImport,
  getImportJob,
  downloadBulkProductRoutingTemplate,
  downloadParamsOnlyTemplate,
} from "@/services/finance/cost-import-api"
import type { CostImportJob, ImportKindKey } from "@/types/finance/cost-import"

export interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Which dataset to import. Defaults to product_routing. */
  kind?: ImportKindKey
}

type Step = "upload" | "uploading" | "starting" | "processing" | "done" | "partial" | "failed"

interface KindConfig {
  title: string
  accept: string
  fileHint: string
  templateLabel: string
  downloadTemplate: () => Promise<void>
}

const KIND_CONFIG: Record<ImportKindKey, KindConfig> = {
  product_routing: {
    title: "Bulk Import — Product Master & Routing",
    accept: ".xlsx,.zip",
    fileHint: "Format: .xlsx (6 sheet) atau .zip berisi CSV per sheet",
    templateLabel: "Template (xlsx)",
    downloadTemplate: downloadBulkProductRoutingTemplate,
  },
  params_only: {
    title: "Bulk Import — Params Only",
    accept: ".zip",
    fileHint: "Format: .zip berisi product_parameters.csv + applicable_params.csv",
    templateLabel: "Template (xlsx)",
    downloadTemplate: downloadParamsOnlyTemplate,
  },
}

const POLL_MS = 3_000
const MAX_POLL_ERRORS = 5

export function BulkImportDialog({ open, onOpenChange, kind = "product_routing" }: BulkImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const abortRef = useRef(false)
  const cfg = KIND_CONFIG[kind]

  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>("upload")
  const [uploadPct, setUploadPct] = useState(0)
  const [job, setJob] = useState<CostImportJob | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)

  function resetState() {
    abortRef.current = false
    setFile(null)
    setStep("upload")
    setUploadPct(0)
    setJob(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  useEffect(() => { if (open) resetState() }, [open, kind])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  async function handleDownloadTemplate() {
    setTemplateLoading(true)
    try {
      await cfg.downloadTemplate()
    } catch (e) {
      toast.error(`Template download gagal: ${String(e)}`)
    } finally {
      setTemplateLoading(false)
    }
  }

  async function pollUntilDone(jobId: number) {
    let pollErrors = 0
    while (!abortRef.current) {
      await new Promise<void>((r) => setTimeout(r, POLL_MS))
      if (abortRef.current) return
      try {
        const j = await getImportJob(jobId)
        setJob(j)
        if (j.status === "DONE") { setStep("done"); return }
        if (j.status === "PARTIAL") { setStep("partial"); return }
        if (j.status === "FAILED") { setStep("failed"); return }
      } catch {
        if (++pollErrors >= MAX_POLL_ERRORS) {
          toast.error("Gagal memantau status job — cek halaman Import Jobs.")
          setStep("failed")
          return
        }
      }
    }
  }

  async function handleImport() {
    if (!file) return
    abortRef.current = false
    try {
      setStep("uploading")
      setUploadPct(0)
      const { uploadUrl, objectKey } = await getImportUploadURL(kind, file.name)
      await putToPresignedUrl(uploadUrl, file, setUploadPct)

      setStep("starting")
      const { jobId } = await startCostingImport(kind, objectKey, file.name)
      toast.success(`Import dijadwalkan — Job #${jobId}`)

      setStep("processing")
      setJob({ jobId } as CostImportJob)
      await pollUntilDone(jobId)
    } catch (e) {
      toast.error(`Import gagal: ${String(e)}`)
      setStep("upload")
    }
  }

  function handleClose() {
    abortRef.current = true
    resetState()
    onOpenChange(false)
  }

  const busy = step === "uploading" || step === "starting" || step === "processing"
  const terminal = step === "done" || step === "partial" || step === "failed"
  const processedPct =
    job && job.totalRows > 0 ? Math.round((job.processed / job.totalRows) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{cfg.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template download + file picker — only before upload starts */}
          {step === "upload" && (
            <>
              <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 shrink-0 text-green-600" />
                  <div className="min-w-0">
                    <p className="font-medium">Import Template</p>
                    <p className="text-sm text-muted-foreground">Unduh template &amp; isi sesuai kolom</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 self-end sm:self-auto"
                  onClick={() => void handleDownloadTemplate()} disabled={templateLoading}>
                  {templateLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {cfg.templateLabel}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Pilih File</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50"
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept={cfg.accept} className="hidden" onChange={handleFileChange} />
                  {file ? (
                    <div className="flex min-w-0 max-w-full items-center gap-2">
                      <FileSpreadsheet className="h-6 w-6 shrink-0 text-green-600" />
                      <span className="min-w-0 truncate font-medium">{file.name}</span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-center text-sm text-muted-foreground">Klik untuk memilih file</p>
                      <p className="text-xs text-muted-foreground">{cfg.fileHint}</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  File diunggah langsung ke storage lalu diproses di server (streaming) — ukuran besar tidak masalah.
                </p>
              </div>
            </>
          )}

          {/* Uploading progress */}
          {step === "uploading" && (
            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Mengunggah file…</span>
                <span className="text-muted-foreground">{uploadPct}%</span>
              </div>
              <Progress value={uploadPct} className="h-2" />
            </div>
          )}

          {/* Starting */}
          {step === "starting" && (
            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Menjadwalkan job…
            </div>
          )}

          {/* Processing — poll job */}
          {step === "processing" && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memproses
                  {job?.jobId ? ` — Job #${job.jobId}` : ""}
                </span>
                {job && <StatusBadge status={job.status || "PENDING"} type="job" size="sm" />}
              </div>
              {job && job.totalRows > 0 && (
                <>
                  <Progress value={processedPct} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {job.processed.toLocaleString()} / {job.totalRows.toLocaleString()} baris diproses
                  </p>
                </>
              )}
              <p className="text-xs text-muted-foreground">
                Dialog boleh ditutup — notifikasi dikirim saat selesai.
              </p>
            </div>
          )}

          {/* Terminal states */}
          {terminal && job && (
            <ResultPanel step={step} job={job} />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={step === "uploading" || step === "starting"}>
            {terminal ? "Tutup" : "Batal"}
          </Button>
          {step === "upload" && file && (
            <Button onClick={() => void handleImport()}>
              <Upload className="mr-2 h-4 w-4" /> Import
            </Button>
          )}
          {(step === "processing" || terminal) && (
            <Button variant={terminal ? "default" : "outline"}
              onClick={() => { handleClose(); router.push("/finance/import-jobs") }} disabled={busy && step !== "processing"}>
              Lihat Import Jobs
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResultPanel({ step, job }: { step: Step; job: CostImportJob }) {
  if (step === "failed") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <div className="min-w-0">
          <p className="font-medium text-red-800 dark:text-red-200">Import gagal — Job #{job.jobId}</p>
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">Buka halaman Import Jobs untuk detail.</p>
        </div>
      </div>
    )
  }
  const isPartial = step === "partial"
  return (
    <div className={`flex items-start gap-3 rounded-lg border p-4 ${isPartial
      ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
      : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"}`}>
      <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${isPartial ? "text-amber-600" : "text-green-600"}`} />
      <div className="min-w-0 space-y-1">
        <p className={`font-medium ${isPartial ? "text-amber-800 dark:text-amber-200" : "text-green-800 dark:text-green-200"}`}>
          {isPartial ? "Selesai dengan sebagian error" : "Import selesai"} — Job #{job.jobId}
        </p>
        <p className="text-sm text-muted-foreground">
          {job.success.toLocaleString()} sukses
          {job.failed > 0 && ` · ${job.failed.toLocaleString()} gagal`}
          {job.skipped > 0 && ` · ${job.skipped.toLocaleString()} dilewati`}
        </p>
        {job.errorFileUrl && (
          <a href={job.errorFileUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-300">
            <ExternalLink className="h-3.5 w-3.5" /> Unduh laporan error
          </a>
        )}
      </div>
    </div>
  )
}
