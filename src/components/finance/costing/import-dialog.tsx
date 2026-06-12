"use client"

import { useRef, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react"

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
import {
  useAsyncImport,
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

  const syncMutation = useSyncImport(entity, onSuccess)
  const asyncImport = useAsyncImport(entity, onSuccess)

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
    if (asyncImport.polling) return
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Import {entity.replace(/_/g, " ")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!asyncImport.polling && !asyncImport.job && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="import-file">Excel file (.xlsx)</Label>
                <input
                  id="import-file"
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="mt-1 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/80"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duplicate-action">Duplicate handling</Label>
                <Select
                  value={duplicateAction}
                  onValueChange={(v) =>
                    setDuplicateAction(v as typeof duplicateAction)
                  }
                >
                  <SelectTrigger id="duplicate-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="update">Update existing rows</SelectItem>
                    <SelectItem value="skip">Skip existing rows</SelectItem>
                    <SelectItem value="error">Error on duplicate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {syncResult && (
            <div className="rounded-md border p-3 text-sm space-y-1">
              <div className="flex items-center gap-2 font-medium">
                {syncResult.failedCount > 0 ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                Import complete
              </div>
              <div className="text-muted-foreground">
                {syncResult.successCount} created · {syncResult.updatedCount}{" "}
                updated · {syncResult.skippedCount} skipped ·{" "}
                {syncResult.failedCount} failed
              </div>
              {syncResult.errors.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                  {syncResult.errors.slice(0, 20).map((e, i) => (
                    <div key={i} className="text-xs text-destructive">
                      Row {e.rowNumber} [{e.field}]: {e.message}
                    </div>
                  ))}
                  {syncResult.errors.length > 20 && (
                    <div className="text-xs text-muted-foreground">
                      + {syncResult.errors.length - 20} more errors…
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {(asyncImport.polling || job) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">
                  {job?.status?.toLowerCase() ?? "starting…"}
                </span>
                {job && (
                  <span className="text-muted-foreground">
                    {job.processed} / {job.totalRows} rows
                  </span>
                )}
              </div>
              <Progress value={progressPercent} className="h-2" />
              {job?.status === "DONE" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  {job.success} rows imported.
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
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={asyncImport.polling}
          >
            {isDone ? "Close" : "Cancel"}
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
