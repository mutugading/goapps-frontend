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
} from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  bulkImportProductMasterRouting,
  downloadBulkProductRoutingTemplate,
  exportBulkProductRouting,
  validateBulkProductRoutingFile,
} from "@/services/finance/cost-import-api"
import type { BulkSheetValidationResult, BulkValidationResult } from "@/types/finance/cost-import"

export interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "upload" | "validating" | "validated" | "submitting" | "done"

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>("upload")
  const [validation, setValidation] = useState<BulkValidationResult | null>(null)
  const [expandedSheets, setExpandedSheets] = useState<Set<string>>(new Set())
  const [jobId, setJobId] = useState<number | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)

  // Stable reset function — called from handleClose and when open changes
  function resetState() {
    setFile(null)
    setStep("upload")
    setValidation(null)
    setExpandedSheets(new Set())
    setJobId(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  // Reset all state when dialog opens
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

  function handleClose() {
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>Bulk Import — Product Master &amp; Routing</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Template Download — hidden once job submitted */}
          {!isDone && (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Import Template</p>
                  <p className="text-sm text-muted-foreground">
                    Download the Excel template with required sheets
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
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
              <Label>Select File</Label>
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
                      Supported: .xlsx
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
              Validating file…
            </div>
          )}

          {/* Validation results table */}
          {validation && !isValidating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {validation.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="font-medium">
                  {validation.isValid
                    ? "File is valid — ready to import"
                    : "Validation failed — fix errors before importing"}
                </span>
              </div>

              <ScrollArea className="max-h-64 rounded border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sheet</TableHead>
                      <TableHead className="text-right">Rows</TableHead>
                      <TableHead className="text-right">Errors</TableHead>
                      <TableHead className="text-right">Warnings</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validation.sheets.map((sheet) => (
                      <React.Fragment key={sheet.sheetName}>
                        <TableRow
                          className={sheet.errorCount > 0 ? "bg-destructive/5" : undefined}
                        >
                          <TableCell className="font-medium">{sheet.sheetName}</TableCell>
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

                        {/* Sample errors for this sheet */}
                        {expandedSheets.has(sheet.sheetName) &&
                          sheet.sampleErrors.map((err, i) => (
                            <TableRow key={`${sheet.sheetName}-err-${i}`} className="bg-muted/30">
                              <TableCell
                                colSpan={5}
                                className="py-1 pl-8 text-xs text-destructive"
                              >
                                Row {err.rowNumber}{err.field ? ` [${err.field}]` : ""}: {err.message}
                              </TableCell>
                            </TableRow>
                          ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}

          {/* Done */}
          {isDone && jobId !== null && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Import queued as Job #{jobId}. You will receive a notification when it
              completes.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {isDone ? "Close" : "Cancel"}
          </Button>

          {/* Validate button — shown when file selected but not yet validated */}
          {file && step === "upload" && (
            <Button onClick={handleValidate} disabled={isValidating}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Validate
            </Button>
          )}

          {/* Start Import button — shown only when validation passed */}
          {canImport && (
            <Button onClick={handleImport} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? "Queueing…" : "Start Import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
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

// Re-export BulkSheetValidationResult for any consumers that import from this module
export type { BulkSheetValidationResult, BulkValidationResult }
