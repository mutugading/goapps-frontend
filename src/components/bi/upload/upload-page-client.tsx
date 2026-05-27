"use client"

// BI Excel Upload — orchestrates the full upload flow:
//   SELECT_TARGET → choose file → PREVIEW (after parse) → COMMITTED / CANCELLED.

import { useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFactDistincts } from "@/hooks/bi/use-fact-distincts"
import {
  useCancelUpload,
  useCommitUpload,
  useParseUpload,
  useUploadTemplate,
} from "@/hooks/bi/use-upload"
import type { NormalizedUpload } from "@/types/bi"
import { UploadSummary } from "./upload-summary"
import { UploadErrorTable } from "./upload-error-table"
import { UploadHistory } from "./upload-history"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

type Phase = "SELECT" | "PREVIEW" | "COMMITTED"

export function UploadPageClient() {
  const [targetType, setTargetType] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("SELECT")
  const [preview, setPreview] = useState<NormalizedUpload | null>(null)
  const [committed, setCommitted] = useState<NormalizedUpload | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: distincts, isLoading: typesLoading } = useFactDistincts("")
  const { download, isDownloading } = useUploadTemplate()
  const parseMutation = useParseUpload()
  const commitMutation = useCommitUpload()
  const cancelMutation = useCancelUpload()

  const targetTypes = distincts?.types ?? []

  function validateAndSetFile(picked: File | null) {
    setFileError(null)
    if (!picked) {
      setFile(null)
      return
    }
    if (!picked.name.toLowerCase().endsWith(".xlsx")) {
      setFileError("Only .xlsx files are supported.")
      setFile(null)
      return
    }
    if (picked.size > MAX_FILE_SIZE) {
      setFileError("File exceeds the 10MB limit.")
      setFile(null)
      return
    }
    setFile(picked)
  }

  function resetToSelect() {
    setFile(null)
    setFileError(null)
    setPreview(null)
    setCommitted(null)
    setPhase("SELECT")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleParse() {
    if (!targetType || !file) return
    const result = await parseMutation.mutateAsync({ targetType, file })
    setPreview(result)
    setPhase("PREVIEW")
  }

  async function handleCommit() {
    if (!preview?.uploadId) return
    const result = await commitMutation.mutateAsync(preview.uploadId)
    setCommitted(result)
    setPhase("COMMITTED")
  }

  async function handleCancel() {
    if (preview?.uploadId) {
      await cancelMutation.mutateAsync(preview.uploadId)
    }
    resetToSelect()
  }

  // ---- COMMITTED success state ----------------------------------------------
  if (phase === "COMMITTED" && committed) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </span>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Upload committed</h2>
              <p className="text-sm text-muted-foreground">
                {committed.committedRows} row(s) imported from{" "}
                <span className="font-medium">{committed.fileName}</span>
                {committed.targetType ? (
                  <>
                    {" "}
                    into <span className="font-medium">{committed.targetType}</span>
                  </>
                ) : null}
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" onClick={resetToSelect}>
                <Upload className="mr-1 size-4" />
                Upload Another
              </Button>
              <Button asChild>
                <Link href="/finance/bi">View Dashboards</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <UploadHistory />
      </div>
    )
  }

  // ---- PREVIEW state ---------------------------------------------------------
  if (phase === "PREVIEW" && preview) {
    const hasValidRows = preview.validRows > 0
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview — {preview.fileName}</CardTitle>
            <CardDescription>
              Target: <span className="font-medium">{preview.targetType}</span>. Review the summary and
              row errors below, then confirm to commit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <UploadSummary upload={preview} />

            {!hasValidRows && (
              <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                No valid rows to commit. Fix the errors and re-upload.
              </div>
            )}

            <div className="space-y-2">
              <Label>Validation Errors ({preview.errors.length})</Label>
              <UploadErrorTable errors={preview.errors} />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={commitMutation.isPending || cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <X className="mr-1 size-4" />
                )}
                Cancel
              </Button>
              <Button onClick={handleCommit} disabled={!hasValidRows || commitMutation.isPending}>
                {commitMutation.isPending ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1 size-4" />
                )}
                Confirm &amp; Commit
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---- SELECT state ----------------------------------------------------------
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Excel Data</CardTitle>
          <CardDescription>
            Pick a target type, download the template if needed, then upload a filled .xlsx file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 — target type */}
          <div className="space-y-2">
            <Label htmlFor="target-type">Target Type</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={targetType} onValueChange={setTargetType} disabled={typesLoading}>
                <SelectTrigger id="target-type" className="w-full sm:w-64">
                  <SelectValue placeholder={typesLoading ? "Loading…" : "Select a target type"} />
                </SelectTrigger>
                <SelectContent>
                  {targetTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => void download(targetType)}
                disabled={!targetType || isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-1 size-4 animate-spin" />
                ) : (
                  <Download className="mr-1 size-4" />
                )}
                Download Template
              </Button>
            </div>
            {targetTypes.length === 0 && !typesLoading && (
              <p className="text-xs text-muted-foreground">
                No target types found. Seed fact data before uploading.
              </p>
            )}
          </div>

          {/* Step 2 — file dropzone */}
          <div className="space-y-2">
            <Label>Excel File (.xlsx, max 10MB)</Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
              }}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                validateAndSetFile(e.dataTransfer.files?.[0] ?? null)
              }}
              className={[
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center transition-colors",
                isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50",
              ].join(" ")}
            >
              <FileSpreadsheet className="size-8 text-muted-foreground/60" />
              {file ? (
                <p className="text-sm font-medium">{file.name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Drag &amp; drop or click to choose a .xlsx file
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => validateAndSetFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {fileError && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3" />
                {fileError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <Button
              onClick={() => void handleParse()}
              disabled={!targetType || !file || parseMutation.isPending}
            >
              {parseMutation.isPending ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Upload className="mr-1 size-4" />
              )}
              Parse &amp; Preview
            </Button>
          </div>
        </CardContent>
      </Card>

      <UploadHistory />
    </div>
  )
}
