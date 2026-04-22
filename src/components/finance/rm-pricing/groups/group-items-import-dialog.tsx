"use client"

// Bulk-import items to a single group from an Excel file.
// Single-sheet template: columns = item_code (required), grade_code (optional),
// sort_order (optional). The backend delegates to the AddItems flow so all
// validation rules (one variant per active group, sync-feed lookup,
// idempotent re-add) stay identical to the interactive picker.

import { useState } from "react"
import { Download, Loader2, Upload } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

import {
  useImportGroupItems,
  useDownloadGroupItemsTemplate,
} from "@/hooks/finance/use-rm-group-items"

interface GroupItemsImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupHeadId: string
  groupCode?: string
}

export function GroupItemsImportDialog({
  open,
  onOpenChange,
  groupHeadId,
  groupCode,
}: GroupItemsImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [lastResult, setLastResult] = useState<{
    added: number
    skipped: number
    failed: number
  } | null>(null)

  const importMutation = useImportGroupItems()
  const templateMutation = useDownloadGroupItemsTemplate()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setLastResult(null)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setFile(null)
      setLastResult(null)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async () => {
    if (!file) return
    const buf = new Uint8Array(await file.arrayBuffer())
    try {
      const res = await importMutation.mutateAsync({
        groupHeadId,
        fileContent: buf,
        fileName: file.name,
      })
      setLastResult({
        added: res.itemsAdded,
        skipped: res.itemsSkipped,
        failed: res.failedCount,
      })
      if (res.itemsAdded > 0 && res.failedCount === 0 && res.itemsSkipped === 0) {
        onOpenChange(false)
      }
    } catch (err) {
      console.error("import items failed", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Items to Group</DialogTitle>
          <DialogDescription>
            {groupCode ? `Target: ${groupCode}. ` : ""}
            Upload an .xlsx file with a single &quot;Items&quot; sheet
            (first-sheet fallback also works). Required column: item_code.
            Optional: grade_code, sort_order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-items-import-file">Excel file</Label>
            <Input
              id="group-items-import-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={importMutation.isPending}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {file.name} · {Math.round(file.size / 1024)} KB
              </p>
            )}
          </div>

          {lastResult && (
            <>
              <Separator />
              <div className="rounded-md border p-3 text-sm">
                <div className="font-medium mb-1">Last import</div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>
                    <div className="text-foreground font-medium">
                      {lastResult.added}
                    </div>
                    Added
                  </div>
                  <div>
                    <div className="text-foreground font-medium">
                      {lastResult.skipped}
                    </div>
                    Skipped
                  </div>
                  <div>
                    <div className="text-foreground font-medium">
                      {lastResult.failed}
                    </div>
                    Failed
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => templateMutation.mutate()}
            disabled={templateMutation.isPending}
          >
            {templateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download template
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={importMutation.isPending}
            >
              Close
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!file || importMutation.isPending}
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
