"use client"

import { Pencil, Trash2 } from "lucide-react"

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { StatusBadge } from "@/components/common"

import type { BoxBobbinCost } from "@/types/finance/box-bobbin-cost"

interface BoxBobbinCostTableProps {
  data: BoxBobbinCost[]
  isLoading?: boolean
  onEdit: (boxBobbinCost: BoxBobbinCost) => void
  onDelete: (boxBobbinCost: BoxBobbinCost) => void
}

export function BoxBobbinCostTable({ data, isLoading, onEdit, onDelete }: BoxBobbinCostTableProps) {
  const columns: ColumnDef<BoxBobbinCost>[] = [
    {
      id: "bbcCode",
      header: "Code",
      width: "w-[140px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.bbcCode || "-"}</span>
      ),
    },
    {
      id: "bbcName",
      header: "Name",
      accessorKey: "bbcName",
    },
    {
      id: "bbcType",
      header: "Type",
      width: "w-[110px]",
      cell: (row) => row.bbcType || "-",
    },
    {
      id: "noOfBob",
      header: "No. Bobbins",
      width: "w-[110px]",
      hideOnMobile: true,
      cell: (row) => row.noOfBob ?? "-",
    },
    {
      id: "notes",
      header: "Notes",
      hideOnMobile: true,
      cellClassName: "max-w-[180px] truncate text-muted-foreground",
      cell: (row) => row.notes || "-",
    },
    {
      id: "isActive",
      header: "Status",
      width: "w-[100px]",
      cell: (row) => (
        <StatusBadge
          status={row.isActive ? "ACTIVE" : "INACTIVE"}
          type="generic"
          size="sm"
        />
      ),
    },
  ]

  const actions: RowAction<BoxBobbinCost>[] = [
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
      tableId="yarn-master-box-bobbin-costs"
      data={data}
      columns={columns}
      keyField="bbcId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No box bobbin costs found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
