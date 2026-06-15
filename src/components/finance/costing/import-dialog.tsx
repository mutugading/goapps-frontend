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

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useAsyncImport,
  useDownloadTemplate,
  useSyncImport,
} from "@/hooks/finance/use-cost-import"
import type {
  CostImportJob,
  ImportEntity,
  SyncImportResult,
} from "@/types/finance/cost-import"

const SYNC_ENTITIES = new Set<ImportEntity>(["product_type", "parameter"])

interface ImportDialogProps {
  entity: ImportEntity
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ImportDialog({
  entity,
  open,
  onOpenChange,
  onSuccess,
}: ImportDialogProps) {
  const isSync = SYNC_ENTITIES.has(entity)
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [duplicateAction, setDuplicateAction] = useState<
    "skip" | "update" | "error"
  >("update")
  const [syncResult, setSyncResult] = useState<SyncImportResult | null>(null)

  const { download: downloadTemplate, loading: templateLoading } =
    useDownloadTemplate()
  const syncMutation = useSyncImport(entity, onSuccess)
  const asyncImport = useAsyncImport(entity, onSuccess)

  // Reset all state when dialog opens so previous import results don't linger
  useEffect(() => {
    if (open) {
      setFile(null)
      setSyncResult(null)
      asyncImport.reset()
      if (fileRef.current) fileRef.current.value = ""
    }
    // asyncImport.reset is stable — no dep needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
    setSyncResult(null)
  }

  function handleSubmit() {
    if (!file) return
    if (isSync) {
      syncMutation.mutate(
        { file, duplicateAction },
        { onSuccess: (r) => setSyncResult(r) },
      )
    } else {
      asyncImport.submitMutation.mutate({ file, duplicateAction })
    }
  }

  function handleClose() {
    // Async imports run in the worker — closing the modal is safe.
    // The worker continues processing and the user receives a notification when done.
    setFile(null)
    setSyncResult(null)
    if (fileRef.current) fileRef.current.value = ""
    onOpenChange(false)
  }

  const isSubmitting =
    syncMutation.isPending || asyncImport.submitMutation.isPending
  const job: CostImportJob | undefined = asyncImport.job
  const progressPercent =
    job && job.totalRows > 0
      ? Math.round((job.processed / job.totalRows) * 100)
      : 0

  const isDone =
    job?.status === "DONE" ||
    job?.status === "FAILED" ||
    job?.status === "PARTIAL"

  const entityLabel = entity.replace(/_/g, " ")

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="capitalize">Import {entityLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template Download */}
          {!asyncImport.polling && !asyncImport.job && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Import Template</p>
                  <p className="text-sm text-muted-foreground">
                    Download the Excel template with required columns
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate(entity)}
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

          {/* File Upload */}
          {!asyncImport.polling && !asyncImport.job && !syncResult && (
            <>
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
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to select or drag and drop an Excel file
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported: .xlsx, .xls
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duplicate Handling</Label>
                <Select
                  value={duplicateAction}
                  onValueChange={(v) =>
                    setDuplicateAction(v as typeof duplicateAction)
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update">
                      Update - Overwrite existing records
                    </SelectItem>
                    <SelectItem value="skip">
                      Skip - Ignore duplicate records
                    </SelectItem>
                    <SelectItem value="error">
                      Error - Stop on duplicate found
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Sync import result */}
          {syncResult && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                {syncResult.failedCount === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-medium">Import Complete</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium text-green-600">
                    {syncResult.successCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium text-blue-600">
                    {syncResult.updatedCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Skipped:</span>
                  <span className="font-medium text-muted-foreground">
                    {syncResult.skippedCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed:</span>
                  <span className="font-medium text-destructive">
                    {syncResult.failedCount}
                  </span>
                </div>
              </div>
              {syncResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">Errors:</p>
                  <ScrollArea className="h-32 rounded border p-2">
                    <ul className="space-y-1 text-sm">
                      {syncResult.errors.slice(0, 20).map((e, i) => (
                        <li key={i} className="text-destructive">
                          Row {e.rowNumber} [{e.field}]: {e.message}
                        </li>
                      ))}
                      {syncResult.errors.length > 20 && (
                        <li className="text-muted-foreground">
                          + {syncResult.errors.length - 20} more errors…
                        </li>
                      )}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {/* Async import progress */}
          {(asyncImport.polling || job) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize font-medium">
                  {job?.status?.toLowerCase() ?? "starting…"}
                </span>
                {job && (
                  <span className="text-muted-foreground">
                    {job.processed} / {job.totalRows} rows
                  </span>
                )}
              </div>
              <Progress value={progressPercent} className="h-2" />

              {asyncImport.polling && !isDone && (
                <p className="text-xs text-muted-foreground">
                  You can close this dialog — import will continue in the
                  background. You&apos;ll receive a notification when it
                  completes.
                </p>
              )}

              {job?.status === "DONE" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {job.success} rows imported successfully.
                </div>
              )}
              {(job?.status === "FAILED" || job?.status === "PARTIAL") && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    {job.success} success · {job.failed} failed
                  </div>
                  {job.errorFileUrl && (
                    <a
                      href={job.errorFileUrl}
                      download
                      className="text-xs text-primary underline"
                    >
                      Download error report
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {isDone || syncResult ? "Close" : "Cancel"}
          </Button>
          {!asyncImport.job && !syncResult && (
            <Button onClick={handleSubmit} disabled={!file || isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? (
                "Importing…"
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Start Import
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
