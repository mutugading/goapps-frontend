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
import { useMutation, useQuery } from "@tanstack/react-query"
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
import { costImportKeys } from "@/hooks/finance/use-cost-import"
import type { CostImportJob } from "@/types/finance/cost-import"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "upload" | "submitting" | "polling" | "done" | "failed"

/**
 * ParamsOnlyImportDialog — imports product_parameters + product_applicable_params
 * from a file that does NOT include a product_master sheet. Mirrors the
 * ImportDialog UX: file picker, background job creation, real-time polling.
 *
 * File is sent as multipart/form-data (binary bytes) to avoid the ~3× JSON
 * inflation that would occur with Array.from(Uint8Array).
 */
export function ParamsOnlyImportDialog({ open, onOpenChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>("upload")
  const [jobId, setJobId] = useState<number | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      setFile(null)
      setStep("upload")
      setJobId(null)
      if (fileRef.current) fileRef.current.value = ""
    }
  }, [open])

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (f: File) => bulkImportParamsOnly(f),
    onSuccess: ({ jobId: id }) => {
      setJobId(id)
      setStep("polling")
    },
    onError: (e) => {
      toast.error(`Failed to start import: ${String(e)}`)
      setStep("upload")
    },
  })

  // Poll job status
  const { data: job } = useQuery<CostImportJob>({
    queryKey: costImportKeys.job(jobId ?? 0),
    queryFn: () => getImportJob(jobId!),
    enabled: step === "polling" && jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === "DONE" || status === "FAILED" || status === "PARTIAL" ? false : 3000
    },
  })

  useEffect(() => {
    if (!job) return
    if (job.status === "DONE") {
      setStep("done")
      toast.success(`Params import complete: ${job.success} rows imported.`)
    } else if (job.status === "PARTIAL") {
      setStep("done")
      toast.warning(`Import completed with ${job.failed} errors — check error report.`)
    } else if (job.status === "FAILED") {
      setStep("failed")
    }
  }, [job?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleDownloadTemplate() {
    setTemplateLoading(true)
    try {
      await downloadParamsOnlyTemplate()
    } catch (e) {
      toast.error(`Template download failed: ${String(e)}`)
    } finally {
      setTemplateLoading(false)
    }
  }

  function handleClose() {
    setFile(null)
    setStep("upload")
    setJobId(null)
    submitMutation.reset()
    if (fileRef.current) fileRef.current.value = ""
    onOpenChange(false)
  }

  const isPolling = step === "polling"
  const isDone = step === "done"
  const isFailed = step === "failed"
  const isSubmitting = submitMutation.isPending

  const progressPercent =
    job && job.totalRows > 0 ? Math.round((job.processed / job.totalRows) * 100) : 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import Params Only (Bulk)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template card */}
          {!isPolling && !isDone && !isFailed && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Params-Only Template</p>
                  <p className="text-sm text-muted-foreground">
                    2 sheets: product_parameters + product_applicable_params
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleDownloadTemplate()}
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

          {/* File picker */}
          {!isPolling && !isDone && !isFailed && (
            <div className="space-y-2">
              <Label>Select File</Label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50"
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      ({(file.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to select or drag and drop an Excel file
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports split part-sheets (_p1, _p2, …) · Sent as binary (large files OK)
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Warning */}
          {!isPolling && !isDone && !isFailed && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                All-or-nothing validation. If any <code className="font-mono text-xs">param_code</code> is
                unknown, the entire job fails and an error report (with{" "}
                <strong>missing_param_codes</strong> tab) is generated. Products must already
                exist from a prior bulk import.
              </span>
            </div>
          )}

          {/* Polling progress */}
          {isPolling && job && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing params…</span>
                <span className="font-medium">
                  {job.processed.toLocaleString()} / {job.totalRows.toLocaleString()} rows
                </span>
              </div>
              {job.totalRows > 0 && (
                <Progress value={progressPercent} className="h-2" />
              )}
              <p className="text-xs text-muted-foreground text-center">
                Running in background — you can close this dialog.
              </p>
            </div>
          )}

          {isPolling && !job && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Queuing import job…
            </div>
          )}

          {/* Done state */}
          {isDone && job && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {job.status === "DONE"
                    ? `Import complete — ${job.success.toLocaleString()} rows imported`
                    : `Partial import — ${job.failed.toLocaleString()} errors`}
                </p>
                {job.errorFileUrl && (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Error report available in Import Jobs.
                  </p>
                )}
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto p-0 text-green-700"
                  onClick={() => router.push("/finance/import-jobs")}
                >
                  View Import Jobs →
                </Button>
              </div>
            </div>
          )}

          {/* Failed state */}
          {isFailed && job && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <XCircle className="h-5 w-5 shrink-0 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">Import failed</p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {"See error report in Import Jobs for details."}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto p-0 text-red-700"
                  onClick={() => router.push("/finance/import-jobs")}
                >
                  View Error Report →
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {isDone || isFailed ? "Close" : "Cancel"}
          </Button>
          {!isPolling && !isDone && !isFailed && (
            <Button
              onClick={() => { if (file) submitMutation.mutate(file) }}
              disabled={!file || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
