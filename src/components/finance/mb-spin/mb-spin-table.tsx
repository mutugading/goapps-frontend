"use client"

import { Pencil, Trash2 } from "lucide-react"

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { StatusBadge } from "@/components/common"

import type { MBSpin } from "@/types/finance/mb-spin"

interface MBSpinTableProps {
  data: MBSpin[]
  isLoading?: boolean
  onEdit: (mbSpin: MBSpin) => void
  onDelete: (mbSpin: MBSpin) => void
}

export function MBSpinTable({ data, isLoading, onEdit, onDelete }: MBSpinTableProps) {
  const columns: ColumnDef<MBSpin>[] = [
    {
      id: "mbsMgtName",
      header: "Mgt Name",
      cell: (row) => row.mbsMgtName || "-",
    },
    {
      id: "mbsMbCosting",
      header: "MB Costing",
      hideOnMobile: true,
      cell: (row) => row.mbsMbCosting || "-",
    },
    {
      id: "mbsDenier",
      header: "Denier",
      width: "w-[90px]",
      hideOnMobile: true,
      cell: (row) => row.mbsDenier?.toFixed(2) ?? "-",
    },
    {
      id: "mbsFilament",
      header: "Filament",
      width: "w-[90px]",
      hideOnMobile: true,
      cell: (row) => row.mbsFilament ?? "-",
    },
    {
      id: "mbsCostRateMkt",
      header: "Rate MKT",
      width: "w-[120px]",
      hideOnMobile: true,
      cell: (row) => row.mbsCostRateMkt != null
        ? `$${row.mbsCostRateMkt.toFixed(4)}`
        : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "mbsIsActive",
      header: "Status",
      width: "w-[100px]",
      cell: (row) => (
        <StatusBadge status={row.mbsIsActive ? "ACTIVE" : "INACTIVE"} type="product" size="sm" />
      ),
    },
  ]

  const actions: RowAction<MBSpin>[] = [
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
      tableId="yarn-master-mb-spins"
      data={data}
      columns={columns}
      keyField="mbsId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No MB spins found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
