"use client"

// Import the full RM Groups set from a 2-sheet Excel ("Groups" + "Items").
// Either sheet may be omitted — header-only and detail-only uploads both work.

import { useState, useRef } from "react"
import {
  Loader2,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
  useImportRMGroups,
  useDownloadRMGroupTemplate,
} from "@/hooks/finance/use-rm-group"
import { readFileAsBytes } from "@/lib/api"

type DuplicateAction = "skip" | "update"

interface RMGroupImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ImportResult {
  groupsCreated: number
  groupsUpdated: number
  groupsSkipped: number
  itemsAdded: number
  itemsSkipped: number
  failedCount: number
  errors: { rowNumber: number; field: string; message: string }[]
}

export function RMGroupImportDialog({
  open,
  onOpenChange,
}: RMGroupImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>("skip")
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const importMutation = useImportRMGroups()
  const templateMutation = useDownloadRMGroupTemplate()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      alert("Please select a valid Excel file (.xlsx or .xls)")
      return
    }
    setSelectedFile(file)
    setImportResult(null)
  }

  const handleImport = async () => {
    if (!selectedFile) return
    try {
      const fileContent = await readFileAsBytes(selectedFile)
      const response = await importMutation.mutateAsync({
        fileContent,
        fileName: selectedFile.name,
        duplicateAction,
      })
      setImportResult({
        groupsCreated: response.groupsCreated,
        groupsUpdated: response.groupsUpdated,
        groupsSkipped: response.groupsSkipped,
        itemsAdded: response.itemsAdded,
        itemsSkipped: response.itemsSkipped,
        failedCount: response.failedCount,
        errors: response.errors || [],
      })
    } catch (error) {
      console.error("Import failed:", error)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setImportResult(null)
    setDuplicateAction("skip")
    onOpenChange(false)
  }

  const isProcessing = importMutation.isPending || templateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : handleClose())}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import RM Groups</DialogTitle>
          <DialogDescription>
            Upload an Excel file with a &quot;Groups&quot; sheet (headers) and/or
            an &quot;Items&quot; sheet (details). Either may be omitted — header
            -only and detail-only uploads both work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Import Template</p>
                <p className="text-sm text-muted-foreground">
                  Two-sheet template with all required columns.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => templateMutation.mutate()}
              disabled={isProcessing}
            >
              {templateMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Select File</Label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-6 w-6 text-green-600" />
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to select an Excel file
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported: .xlsx, .xls
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Duplicate group_code handling</Label>
            <Select
              value={duplicateAction}
              onValueChange={(value: DuplicateAction) =>
                setDuplicateAction(value)
              }
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip">
                  Skip — ignore existing groups
                </SelectItem>
                <SelectItem value="update">
                  Update — overwrite existing groups
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Items are always additive: items already active in ANOTHER group
              are reported as skipped, items already in the target group are
              ignored.
            </p>
          </div>

          {importResult && (
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                {importResult.failedCount === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                )}
                <span className="font-medium">Import Complete</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Groups created:</span>
                  <span className="font-medium text-green-600">
                    {importResult.groupsCreated}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Groups updated:</span>
                  <span className="font-medium text-blue-600">
                    {importResult.groupsUpdated}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Groups skipped:</span>
                  <span className="font-medium text-muted-foreground">
                    {importResult.groupsSkipped}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items added:</span>
                  <span className="font-medium text-green-600">
                    {importResult.itemsAdded}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items skipped:</span>
                  <span className="font-medium text-muted-foreground">
                    {importResult.itemsSkipped}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Failed rows:</span>
                  <span className="font-medium text-destructive">
                    {importResult.failedCount}
                  </span>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">Errors:</p>
                  <ScrollArea className="h-32 rounded border p-2">
                    <ul className="space-y-1 text-sm">
                      {importResult.errors.map((err, i) => (
                        <li key={i} className="text-destructive">
                          Row {err.rowNumber}: {err.field || "—"} —{" "}
                          {err.message}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            {importResult ? "Close" : "Cancel"}
          </Button>
          {!importResult && (
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isProcessing}
            >
              {importMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Import
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
