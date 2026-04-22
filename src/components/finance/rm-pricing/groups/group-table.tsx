"use client"

import { Pencil, Trash2, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { RMGroupHead } from "@/types/finance/rm-group"
import { RM_GROUP_FLAG_LABELS } from "@/types/finance/rm-group"
import { RMGroupFlag } from "@/types/generated/finance/v1/rm_group"

interface GroupTableProps {
  data: RMGroupHead[]
  isLoading?: boolean
  onEdit: (group: RMGroupHead) => void
  onDelete: (group: RMGroupHead) => void
  onView: (group: RMGroupHead) => void
}

function formatFlag(flag: number | undefined): string {
  if (flag === undefined) return "—"
  return RM_GROUP_FLAG_LABELS[flag as RMGroupFlag] || "—"
}

function formatDecimal(val: number | undefined | null, digits = 4): string {
  if (val === undefined || val === null) return "—"
  return val.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  })
}

function FlagCell({
  flag,
  initVal,
}: {
  flag: number | undefined
  initVal: number | null | undefined
}) {
  const isInit = flag === RMGroupFlag.RM_GROUP_FLAG_INIT
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Badge variant="outline" className="text-[10px]">
        {formatFlag(flag)}
      </Badge>
      {isInit && (
        <span className="font-mono text-[10px] text-muted-foreground">
          {formatDecimal(initVal, 2)}
        </span>
      )}
    </div>
  )
}

export function GroupTable({ data, isLoading, onEdit, onDelete, onView }: GroupTableProps) {
  const columns: ColumnDef<RMGroupHead>[] = [
    {
      id: "groupCode",
      header: "Code",
      width: "w-[140px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.groupCode || "-"}</span>
      ),
    },
    {
      id: "groupName",
      header: "Name",
      accessorKey: "groupName",
    },
    {
      id: "flags",
      header: "Flags (V / M / S)",
      hideOnMobile: true,
      cell: (row) => (
        <div className="flex items-start gap-2 text-xs font-mono">
          <FlagCell flag={row.flagValuation} initVal={row.initValValuation} />
          <span className="pt-1">/</span>
          <FlagCell flag={row.flagMarketing} initVal={row.initValMarketing} />
          <span className="pt-1">/</span>
          <FlagCell flag={row.flagSimulation} initVal={row.initValSimulation} />
        </div>
      ),
    },
    {
      id: "costPercentage",
      header: "Cost %",
      hideOnMobile: true,
      cell: (row) => (
        <span className="font-mono text-sm">{formatDecimal(row.costPercentage)}</span>
      ),
    },
    {
      id: "costPerKg",
      header: "Cost/Kg",
      hideOnMobile: true,
      cell: (row) => (
        <span className="font-mono text-sm">{formatDecimal(row.costPerKg)}</span>
      ),
    },
    {
      id: "isActive",
      header: "Status",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ]

  const actions: RowAction<RMGroupHead>[] = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
    },
    {
      id: "edit",
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: "destructive",
    },
  ]

  return (
    <DataTable
      data={data}
      columns={columns}
      keyField="groupHeadId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No RM groups found"
      emptyDescription="Create a new group to get started"
    />
  )
}
