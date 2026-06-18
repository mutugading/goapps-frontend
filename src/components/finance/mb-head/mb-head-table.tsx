"use client"

import { Pencil, Trash2 } from "lucide-react"

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { StatusBadge } from "@/components/common"

import type { MBHead } from "@/types/finance/mb-head"

interface MBHeadTableProps {
  data: MBHead[]
  isLoading?: boolean
  onEdit: (mbHead: MBHead) => void
  onDelete: (mbHead: MBHead) => void
}

export function MBHeadTable({ data, isLoading, onEdit, onDelete }: MBHeadTableProps) {
  const columns: ColumnDef<MBHead>[] = [
    {
      id: "mbhMbCosting",
      header: "MB Costing",
      width: "w-[160px]",
      cell: (row) => <span className="font-medium font-mono">{row.mbhMbCosting || "-"}</span>,
    },
    {
      id: "mbhMgtName",
      header: "Mgt Name",
      cell: (row) => row.mbhMgtName || "-",
    },
    {
      id: "mbhDenier",
      header: "Denier",
      width: "w-[90px]",
      hideOnMobile: true,
      cell: (row) => row.mbhDenier?.toFixed(2) ?? "-",
    },
    {
      id: "mbhFilament",
      header: "Filament",
      width: "w-[90px]",
      hideOnMobile: true,
      cell: (row) => row.mbhFilament ?? "-",
    },
    {
      id: "mbhIsActive",
      header: "Status",
      width: "w-[100px]",
      cell: (row) => (
        <StatusBadge status={row.mbhIsActive ? "ACTIVE" : "INACTIVE"} type="product" size="sm" />
      ),
    },
  ]

  const actions: RowAction<MBHead>[] = [
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
      tableId="yarn-master-mb-heads"
      data={data}
      columns={columns}
      keyField="mbhId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No MB heads found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
