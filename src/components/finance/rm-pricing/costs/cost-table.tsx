"use client"

import { Eye, History, ListTree } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { RMCost } from "@/types/finance/rm-cost"
import {
  RM_VALUATION_FLAG_LABELS,
  RM_MARKETING_FLAG_LABELS,
} from "@/types/finance/rm-group"
import {
  RMValuationFlag,
  RMMarketingFlag,
} from "@/types/generated/finance/v1/rm_group"

interface CostTableProps {
  data: RMCost[]
  isLoading?: boolean
  onViewDetail: (cost: RMCost) => void
  onViewHistory: (cost: RMCost) => void
  onViewItems?: (cost: RMCost) => void
}

function formatRate(val: number | undefined | null, digits = 4): string {
  if (val === undefined || val === null || val === 0) return "—"
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  })
}

/** Format a decimal-stored percent (0.04) as a whole-percent string ("4.00"). */
function formatPctFromDecimal(val: number | undefined | null, digits = 2): string {
  if (val === undefined || val === null || val === 0) return "—"
  return (val * 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  })
}

function valuationFlagShort(flag: number | undefined): string {
  const f = (flag ?? RMValuationFlag.RM_VALUATION_FLAG_UNSPECIFIED) as RMValuationFlag
  if (f === RMValuationFlag.RM_VALUATION_FLAG_UNSPECIFIED) return "AUTO"
  return RM_VALUATION_FLAG_LABELS[f]?.split(" ")[0] || "AUTO"
}

function marketingFlagShort(flag: number | undefined): string {
  const f = (flag ?? RMMarketingFlag.RM_MARKETING_FLAG_UNSPECIFIED) as RMMarketingFlag
  if (f === RMMarketingFlag.RM_MARKETING_FLAG_UNSPECIFIED) return "AUTO"
  return RM_MARKETING_FLAG_LABELS[f]?.split(" ")[0] || "AUTO"
}

const num = "text-right font-mono text-xs"
const numHead = "text-right"
const numWidth = "w-[90px]"
const flagWidth = "w-[80px]"

export function CostTable({
  data,
  isLoading,
  onViewDetail,
  onViewHistory,
  onViewItems,
}: CostTableProps) {
  // Column order mirrors the Excel reference (Testing_RM_Cost.xlsx row 4):
  // BASE: CR, SR, PR | VALUATION: CL, SL, FL → flag → cost_val |
  // MARKETING: FR (editable), Sim Rate (input), projections, SP/PP/FP → flag → cost_mark |
  // SIMULATION: cost_sim.
  const columns: ColumnDef<RMCost>[] = [
    {
      id: "period",
      header: "Period",
      widthPx: 90,
      sticky: "left",
      canHide: false,
      cell: (row) => (
        <Badge variant="outline" className="font-mono">
          {row.period || "—"}
        </Badge>
      ),
    },
    {
      id: "rmCode",
      header: "Code",
      widthPx: 140,
      sticky: "left",
      canHide: false,
      cell: (row) => (
        <span className="font-medium font-mono">{row.rmCode || "—"}</span>
      ),
    },
    {
      id: "rmName",
      header: "Name",
      widthPx: 200,
      sticky: "left",
      canHide: false,
      cell: (row) => <span className="truncate text-sm">{row.rmName || "—"}</span>,
    },

    // ── Base rates (Excel E5/F5/G5) ──
    { id: "crRate", header: "CR", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.crRate) },
    { id: "srRate", header: "SR", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.srRate) },
    { id: "prRate", header: "PR", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.prRate) },

    // ── Valuation landed (H5/I5/J5) ──
    { id: "clRate", header: "CL", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.clRate) },
    { id: "slRate", header: "SL", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.slRate) },
    { id: "flRate", header: "FL", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.flRate) },
    {
      id: "valuationFlag",
      header: "Val Flag",
      width: flagWidth,
      cell: (row) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {valuationFlagShort(row.valuationFlag)}
        </Badge>
      ),
    },
    {
      id: "costVal",
      header: "Valuation Cost",
      width: "w-[130px]",
      headerClassName: numHead,
      cellClassName: "text-right font-mono text-sm font-semibold",
      cell: (row) => formatRate(row.costValuation),
    },

    // ── Marketing inputs (M5/N5/O5..R5) ──
    { id: "marketingFixRate", header: "FR", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.marketingDefaultValue) },
    { id: "simulationRate", header: "Sim Rate", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.simulationRate) },
    { id: "projFreight", header: "Proj Freight", width: numWidth, headerClassName: numHead, cellClassName: num, defaultHidden: true, cell: (row) => formatRate(row.marketingFreightRate) },
    { id: "projAnti", header: "Proj Anti %", width: numWidth, headerClassName: numHead, cellClassName: num, defaultHidden: true, cell: (row) => formatPctFromDecimal(row.marketingAntiDumpingPct) },
    { id: "projDuty", header: "Proj Duty %", width: numWidth, headerClassName: numHead, cellClassName: num, defaultHidden: true, cell: (row) => formatPctFromDecimal(row.marketingDutyPct) },
    { id: "projTransport", header: "Proj Transport", width: "w-[110px]", headerClassName: numHead, cellClassName: num, defaultHidden: true, cell: (row) => formatRate(row.marketingTransportRate) },

    // ── Marketing landed (S5/T5/U5) ──
    { id: "spRate", header: "SP", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.spRate) },
    { id: "ppRate", header: "PP", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.ppRate) },
    { id: "fpRate", header: "FP", width: numWidth, headerClassName: numHead, cellClassName: num, cell: (row) => formatRate(row.fpRate) },
    {
      id: "marketingFlag",
      header: "Mkt Flag",
      width: flagWidth,
      cell: (row) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {marketingFlagShort(row.marketingFlag)}
        </Badge>
      ),
    },
    {
      id: "costMark",
      header: "Marketing Cost",
      width: "w-[130px]",
      headerClassName: numHead,
      cellClassName: "text-right font-mono text-sm font-semibold",
      cell: (row) => formatRate(row.costMarketing),
    },

    // ── Simulation cost (X5) ──
    {
      id: "costSim",
      header: "Simulation Cost",
      width: "w-[130px]",
      headerClassName: numHead,
      cellClassName: "text-right font-mono text-sm font-semibold",
      cell: (row) => formatRate(row.costSimulation),
    },
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
      tableId="rmcost.list.v2"
      stickyActions
      emptyMessage="No cost data found"
      emptyDescription="Trigger a recalculation or wait for Oracle sync"
    />
  )
}
