"use client"

// Tax-status history of one employee (D-82 (1), T033n4): status valid from a date until the next row.

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePayrollTaxHistory } from "@/hooks/payroll"

const SOURCE_LABEL: Record<string, string> = {
  BACKFILL: "Initial (backfill)",
  INSERT: "New employee",
  UPDATE: "Status change",
  CORRECT: "Correction",
}

function formatCreatedAt(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString("en-GB", { timeZone: "Asia/Jakarta" })
}

export function TaxHistoryTable({ employeeId }: { employeeId: number }) {
  const history = usePayrollTaxHistory(employeeId)

  if (history.isLoading) return <div className="h-16 animate-pulse rounded-md bg-muted" />
  if (history.isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {history.error instanceof Error ? history.error.message : "Failed to load tax-status history"}
      </p>
    )
  }
  const rows = history.data ?? []
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No tax-status history recorded.</p>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Valid from</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Recorded by</TableHead>
          <TableHead>Recorded at (WIB)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={`${r.validFrom}`}>
            <TableCell className="whitespace-nowrap">{r.validFrom}</TableCell>
            <TableCell className="font-mono font-medium">{r.taxId}</TableCell>
            <TableCell>
              <Badge variant={r.source === "CORRECT" ? "default" : "secondary"}>{SOURCE_LABEL[r.source] ?? r.source}</Badge>
            </TableCell>
            <TableCell className="max-w-xs whitespace-normal break-words">{r.reason || "-"}</TableCell>
            <TableCell>{r.createdBy || "-"}</TableCell>
            <TableCell className="whitespace-nowrap">{formatCreatedAt(r.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
