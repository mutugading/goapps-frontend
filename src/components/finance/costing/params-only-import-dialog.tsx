"use client"

import { useRef, useState } from "react"
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  bulkImportParamsOnly,
  downloadParamsOnlyTemplate,
} from "@/services/finance/cost-import-api"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * ParamsOnlyImportDialog — imports product_parameters + product_applicable_params
 * from a file that does NOT include a product_master sheet. Products must already
 * exist in the database from a prior bulk_product_routing import.
 *
 * Supports split part-sheets (product_parameters_p1 + _p2, etc.) automatically.
 * Validation is all-or-nothing on the backend — if any param code is unknown or
 * any cross-reference fails, the import aborts and an error report is generated.
 */
export function ParamsOnlyImportDialog({ open, onOpenChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [templateLoading, setTemplateLoading] = useState(false)
  const router = useRouter()

  function reset() {
    setFile(null)
    setIsSubmitting(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleClose() {
    reset()
    onOpenChange(false)
  }

  async function handleTemplate() {
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
    setIsSubmitting(true)
    try {
      const result = await bulkImportParamsOnly(file)
      toast.success(`Params import queued — Job #${result.jobId}`, {
        description: "All-or-nothing validation runs first. Check Import Jobs for results.",
        action: {
          label: "Lihat Jobs",
          onClick: () => router.push("/finance/import-jobs"),
        },
        duration: 8000,
      })
      handleClose()
    } catch (e) {
      toast.error(`Import failed: ${String(e)}`)
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Params Only</DialogTitle>
          <DialogDescription className="space-y-1">
            <span className="block">
              Upload a file containing <strong>product_parameters</strong> and{" "}
              <strong>product_applicable_params</strong> sheets.
            </span>
            <span className="block text-xs">
              Split part-sheets (e.g. <code className="font-mono">_p1</code>,{" "}
              <code className="font-mono">_p2</code>) are merged automatically.
              Products must already exist from a prior bulk import.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="params-file">Excel file (.xlsx)</Label>
            <input
              id="params-file"
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-input file:text-xs file:font-medium file:bg-background file:text-foreground hover:file:bg-accent cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 rounded border bg-muted/40 px-3 py-2 text-sm">
              <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{file.name}</span>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </div>
          )}

          <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Import is all-or-nothing: if any param code is unknown the entire job
            fails and an error report is generated. Check{" "}
            <strong>Finance &gt; Master &gt; Parameter</strong> first.
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTemplate}
            disabled={templateLoading}
          >
            {templateLoading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="mr-2 h-3.5 w-3.5" />
            )}
            Template
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={() => void handleImport()} disabled={!file || isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
