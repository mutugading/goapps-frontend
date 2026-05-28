// BI Upload — scrollable per-row validation error table.

import { CheckCircle2 } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { NormalizedUploadError } from "@/types/bi"

export interface UploadErrorTableProps {
  errors: NormalizedUploadError[]
}

export function UploadErrorTable({ errors }: UploadErrorTableProps) {
  if (errors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-500/70" />
        <p className="text-sm text-muted-foreground">No validation errors — all rows are valid.</p>
      </div>
    )
  }

  return (
    <div className="max-h-80 overflow-auto rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow>
            <TableHead className="w-16">Row</TableHead>
            <TableHead className="w-32">Column</TableHead>
            <TableHead className="w-40">Value</TableHead>
            <TableHead>Issue</TableHead>
            <TableHead className="w-40">Expected</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {errors.map((err, idx) => (
            <TableRow key={`${err.row}-${err.column}-${idx}`}>
              <TableCell className="font-mono text-xs">{err.row}</TableCell>
              <TableCell className="font-medium">{err.column || "—"}</TableCell>
              <TableCell className="max-w-40 truncate font-mono text-xs" title={err.value}>
                {err.value || "—"}
              </TableCell>
              <TableCell className="text-destructive">{err.issue}</TableCell>
              <TableCell className="text-muted-foreground">{err.expected || "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
