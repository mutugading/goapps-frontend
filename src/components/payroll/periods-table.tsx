"use client"

import { CheckCircle2, Lock, Unlock } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { usePermission } from "@/lib/hooks/use-permission"
import type { Period } from "@/types/generated/payroll/v1/run"

import {
  PERM_PERIOD_APPROVE,
  PERM_PERIOD_CLOSE,
  PERM_PERIOD_REOPEN,
  formatYymm,
  periodStatusVariant,
} from "./payroll-format"

export type PeriodDialogAction = "approve" | "close" | "reopen"

interface PeriodsTableProps {
  data: Period[]
  isLoading?: boolean
  onAction: (action: PeriodDialogAction, period: Period) => void
}

/** Which actions the status allows (mirrors the service: approve from DRAFT, close from APPROVED, reopen from APPROVED/CLOSED). */
export function allowedPeriodActions(status: string): PeriodDialogAction[] {
  switch (status) {
    case "DRAFT":
      return ["approve"]
    case "APPROVED":
      return ["close", "reopen"]
    case "CLOSED":
      return ["reopen"]
    default:
      return []
  }
}

export function PeriodsTable({ data, isLoading, onAction }: PeriodsTableProps) {
  const { hasPermission } = usePermission()

  const columns: ColumnDef<Period>[] = [
    { id: "yymm", header: "Period", cellClassName: "font-medium", cell: (row) => formatYymm(row.yymm) },
    { id: "division", header: "Division", accessorKey: "division" },
    {
      id: "range",
      header: "Date Range",
      hideOnMobile: true,
      cellClassName: "text-muted-foreground",
      cell: (row) => (row.dateFrom && row.dateTo ? `${row.dateFrom} - ${row.dateTo}` : "-"),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <Badge variant={periodStatusVariant(row.status)}>{row.status}</Badge>,
    },
    {
      id: "activeRunId",
      header: "Active Run",
      cellClassName: "font-mono",
      cell: (row) => (row.activeRunId > 0 ? `#${row.activeRunId}` : "-"),
    },
    {
      id: "approved",
      header: "Approved By",
      hideOnMobile: true,
      cellClassName: "text-muted-foreground",
      cell: (row) => row.approvedBy || "-",
    },
    {
      id: "closed",
      header: "Closed By",
      hideOnMobile: true,
      cellClassName: "text-muted-foreground",
      cell: (row) => row.closedBy || "-",
    },
    {
      id: "reopenReason",
      header: "Reopen Reason",
      hideOnMobile: true,
      cellClassName: "max-w-[220px] truncate text-muted-foreground",
      cell: (row) => row.reopenReason || "-",
    },
  ]

  const actions: RowAction<Period>[] = []
  if (hasPermission(PERM_PERIOD_APPROVE)) {
    actions.push({
      id: "approve",
      label: "Approve",
      icon: <CheckCircle2 className="h-4 w-4" />,
      onClick: (row) => onAction("approve", row),
      disabled: (row) => !allowedPeriodActions(row.status).includes("approve"),
    })
  }
  if (hasPermission(PERM_PERIOD_CLOSE)) {
    actions.push({
      id: "close",
      label: "Close",
      icon: <Lock className="h-4 w-4" />,
      onClick: (row) => onAction("close", row),
      disabled: (row) => !allowedPeriodActions(row.status).includes("close"),
    })
  }
  if (hasPermission(PERM_PERIOD_REOPEN)) {
    actions.push({
      id: "reopen",
      label: "Reopen",
      icon: <Unlock className="h-4 w-4" />,
      variant: "destructive",
      onClick: (row) => onAction("reopen", row),
      disabled: (row) => !allowedPeriodActions(row.status).includes("reopen"),
    })
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      getRowKey={(row) => `${row.yymm}-${row.division}`}
      actions={actions.length > 0 ? actions : undefined}
      isLoading={isLoading}
      emptyMessage="No payroll periods found"
      emptyDescription="Periods appear once a run has been committed"
    />
  )
}
