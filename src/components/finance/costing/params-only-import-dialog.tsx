"use client"

import { useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
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
import {
  bulkImportParamsOnly,
  downloadParamsOnlyTemplate,
} from "@/services/finance/cost-import-api"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "upload" | "submitting" | "done"

/**
 * ParamsOnlyImportDialog — imports product_parameters + product_applicable_params
 * from a file that does NOT include a product_master sheet. Products must already
 * exist in the database from a prior bulk_product_routing import.
 *
 * Both sheets are optional — you can include just one or both.
 * Split part-sheets (e.g. product_parameters_p1 + _p2) are merged automatically.
 * Validation is all-or-nothing on the backend — an error report (with a dedicated
 * "missing_param_codes" tab) is generated if any row is invalid.
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

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

  async function handleImport() {
    if (!file) return
    setStep("submitting")
    try {
      const result = await bulkImportParamsOnly(file)
      setJobId(result.jobId)
      setStep("done")
      toast.success(`Params import queued — Job #${result.jobId}`, {
        description: "Validation runs first (all-or-nothing). Check Import Jobs for the result.",
        action: {
          label: "Lihat Jobs",
          onClick: () => router.push("/finance/import-jobs"),
        },
        duration: 8000,
      })
    } catch (e) {
      toast.error(`Import failed: ${String(e)}`)
      setStep("upload")
    }
  }

  function handleClose() {
    setFile(null)
    setStep("upload")
    setJobId(null)
    if (fileRef.current) fileRef.current.value = ""
    onOpenChange(false)
  }

  const isSubmitting = step === "submitting"
  const isDone = step === "done"

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Import Params Only (Bulk)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template download card */}
          {!isDone && (
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

          {/* File upload */}
          {!isDone && (
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
                  onChange={handleFileChange}
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
                      Supports split part-sheets (_p1, _p2, …) automatically
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Warning */}
          {!isDone && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Import is all-or-nothing. If any <code className="font-mono text-xs">param_code</code>{" "}
                is not registered in{" "}
                <strong>Finance &gt; Master &gt; Parameter</strong>, the entire import
                fails and a{" "}
                <strong>missing_param_codes</strong> sheet is added to the error report.
              </span>
            </div>
          )}

          {/* Done state */}
          {isDone && jobId && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  Import queued — Job #{jobId}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Validation runs first. You&apos;ll receive a notification when done.
                </p>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {isDone ? "Close" : "Cancel"}
          </Button>
          {!isDone && (
            <Button
              onClick={() => void handleImport()}
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
