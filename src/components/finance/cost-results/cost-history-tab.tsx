"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { UserName } from "@/components/common/user-name"
import { useCostHistory } from "@/hooks/finance/use-cost-calc"
import type { CalculationType } from "@/types/finance/cost-calc"

import { formatDate, formatNumeric } from "./format"

interface Props {
  productSysId: number
  calcType?: CalculationType
}

export function CostHistoryTab({ productSysId, calcType }: Props) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useCostHistory(productSysId, {
    calculationType: calcType ?? "",
    page,
    pageSize: 20,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }
  if (!data || data.items.length === 0) {
    return <div className="py-2 text-sm text-muted-foreground">No history yet.</div>
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Period</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Cost per unit</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Calculated</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((row) => (
              <TableRow key={row.costId}>
                <TableCell className="font-mono text-sm">{row.period}</TableCell>
                <TableCell className="text-sm">{row.calculationType}</TableCell>
                <TableCell className="font-mono text-sm">v{row.version}</TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {formatNumeric(row.costPerUnit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <VarianceCell value={row.variancePctFromPrevious} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} type="cost" size="sm" />
                </TableCell>
                <TableCell className="text-sm">{formatDate(row.calculatedAt)}</TableCell>
                <TableCell className="text-sm">
                  {row.calculatedBy ? (
                    <UserName userId={row.calculatedBy} compact />
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Page {page} of {data.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(data.totalPages, page + 1))}
              disabled={page >= data.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function VarianceCell({ value }: { value: string }) {
  if (!value || value === "0" || value === "0.0000") {
    return <span className="text-muted-foreground">—</span>
  }
  const n = Number(value)
  if (!Number.isFinite(n)) return <span>{value}</span>
  const sign = n > 0 ? "+" : ""
  const colorCls =
    Math.abs(n) > 5 ? "text-amber-600 font-semibold" : "text-muted-foreground"
  return (
    <span className={colorCls}>
      {sign}
      {n.toFixed(2)}%
    </span>
  )
}
