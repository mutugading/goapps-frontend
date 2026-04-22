"use client"

import { Eye, History, ListTree } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { RMCost } from "@/types/finance/rm-cost"
import { RM_GROUP_FLAG_LABELS } from "@/types/finance/rm-group"
import { RMGroupFlag } from "@/types/generated/finance/v1/rm_group"

interface CostTableProps {
  data: RMCost[]
  isLoading?: boolean
  onViewDetail: (cost: RMCost) => void
  onViewHistory: (cost: RMCost) => void
  onViewItems?: (cost: RMCost) => void
}

function formatCost(val: number | undefined): string {
  if (val === undefined || val === null) return "—"
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

function formatRate(val: number | undefined): string {
  if (val === undefined || val === null || val === 0) return "—"
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

function formatFlag(flag: number | undefined): string {
  if (flag === undefined) return "—"
  return RM_GROUP_FLAG_LABELS[flag as RMGroupFlag] || "—"
}

export function CostTable({
  data,
  isLoading,
  onViewDetail,
  onViewHistory,
  onViewItems,
}: CostTableProps) {
  const columns: ColumnDef<RMCost>[] = [
    {
      id: "period",
      header: "Period",
      width: "w-[90px]",
      cell: (row) => (
        <Badge variant="outline" className="font-mono">
          {row.period || "—"}
        </Badge>
      ),
    },
    {
      id: "rmCode",
      header: "RM Code",
      width: "w-[140px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.rmCode || "—"}</span>
      ),
    },
    {
      id: "rmName",
      header: "Name",
      cell: (row) => (
        <span className="text-sm">{row.rmName || "—"}</span>
      ),
    },
    {
      id: "costValuation",
      header: "Valuation",
      width: "w-[140px]",
      headerClassName: "text-right",
      cellClassName: "text-right",
      hideOnMobile: true,
      cell: (row) => (
        <div className="font-mono text-sm">
          <span>{formatCost(row.costValuation)}</span>
          <div className="text-[10px] text-muted-foreground">
            {formatFlag(row.flagValuationUsed)}
          </div>
        </div>
      ),
    },
    {
      id: "costMarketing",
      header: "Marketing",
      width: "w-[140px]",
      headerClassName: "text-right",
      cellClassName: "text-right",
      hideOnMobile: true,
      cell: (row) => (
        <div className="font-mono text-sm">
          <span>{formatCost(row.costMarketing)}</span>
          <div className="text-[10px] text-muted-foreground">
            {formatFlag(row.flagMarketingUsed)}
          </div>
        </div>
      ),
    },
    {
      id: "costSimulation",
      header: "Simulation",
      width: "w-[140px]",
      headerClassName: "text-right",
      cellClassName: "text-right",
      hideOnMobile: true,
      cell: (row) => (
        <div className="font-mono text-sm">
          <span>{formatCost(row.costSimulation)}</span>
          <div className="text-[10px] text-muted-foreground">
            {formatFlag(row.flagSimulationUsed)}
          </div>
        </div>
      ),
    },
    { id: "consRate",   header: "Cons",    width: "w-[100px]", headerClassName: "text-right", cellClassName: "text-right font-mono text-xs", hideOnMobile: true, cell: (row) => formatRate(row.rates?.cons) },
    { id: "storesRate", header: "Stores",  width: "w-[100px]", headerClassName: "text-right", cellClassName: "text-right font-mono text-xs", hideOnMobile: true, cell: (row) => formatRate(row.rates?.stores) },
    { id: "deptRate",   header: "Dept",    width: "w-[100px]", headerClassName: "text-right", cellClassName: "text-right font-mono text-xs", hideOnMobile: true, cell: (row) => formatRate(row.rates?.dept) },
    { id: "po1Rate",    header: "PO 1",    width: "w-[100px]", headerClassName: "text-right", cellClassName: "text-right font-mono text-xs", hideOnMobile: true, cell: (row) => formatRate(row.rates?.po1) },
    { id: "po2Rate",    header: "PO 2",    width: "w-[100px]", headerClassName: "text-right", cellClassName: "text-right font-mono text-xs", hideOnMobile: true, cell: (row) => formatRate(row.rates?.po2) },
    { id: "po3Rate",    header: "PO 3",    width: "w-[100px]", headerClassName: "text-right", cellClassName: "text-right font-mono text-xs", hideOnMobile: true, cell: (row) => formatRate(row.rates?.po3) },
  ]

  const actions: RowAction<RMCost>[] = [
    {
      id: "detail",
      label: "View Detail",
      icon: <Eye className="h-4 w-4" />,
      onClick: onViewDetail,
    },
    {
      id: "history",
      label: "View History",
      icon: <History className="h-4 w-4" />,
      onClick: onViewHistory,
    },
    ...(onViewItems
      ? [
          {
            id: "items",
            label: "View Group Items",
            icon: <ListTree className="h-4 w-4" />,
            onClick: onViewItems,
            disabled: (row: RMCost) => !row.groupHeadId,
          } satisfies RowAction<RMCost>,
        ]
      : []),
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      keyField="rmCostId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No cost data found"
      emptyDescription="Trigger a recalculation or wait for Oracle sync"
    />
  )
}
