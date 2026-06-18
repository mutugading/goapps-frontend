"use client"

import { Pencil, Trash2 } from "lucide-react"

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { StatusBadge } from "@/components/common"

import type { Intermingling } from "@/types/finance/intermingling"

interface InterminglingTableProps {
  data: Intermingling[]
  isLoading?: boolean
  onEdit: (intermingling: Intermingling) => void
  onDelete: (intermingling: Intermingling) => void
}

export function InterminglingTable({ data, isLoading, onEdit, onDelete }: InterminglingTableProps) {
  const columns: ColumnDef<Intermingling>[] = [
    {
      id: "intmCode",
      header: "Code",
      width: "w-[140px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.intmCode || "-"}</span>
      ),
    },
    {
      id: "intmName",
      header: "Name",
      accessorKey: "intmName",
    },
    {
      id: "intmCostPerKg",
      header: "Cost/kg",
      width: "w-[120px]",
      cell: (row) => row.intmCostPerKg?.toFixed(4) ?? "-",
    },
    {
      id: "notes",
      header: "Notes",
      hideOnMobile: true,
      cellClassName: "max-w-[200px] truncate text-muted-foreground",
      cell: (row) => row.notes || "-",
    },
    {
      id: "isActive",
      header: "Status",
      width: "w-[100px]",
      cell: (row) => (
        <StatusBadge status={row.isActive ? "ACTIVE" : "INACTIVE"} type="product" size="sm" />
      ),
    },
  ]

  const actions: RowAction<Intermingling>[] = [
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
      tableId="yarn-master-interminglings"
      data={data}
      columns={columns}
      keyField="intmId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No interminglings found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
