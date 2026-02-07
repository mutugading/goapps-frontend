"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import { type UOM, UOM_CATEGORY_LABELS, UOMCategory } from "@/types/finance/uom"

interface UOMTableProps {
  data: UOM[]
  isLoading?: boolean
  onEdit: (uom: UOM) => void
  onDelete: (uom: UOM) => void
}

export function UOMTable({ data, isLoading, onEdit, onDelete }: UOMTableProps) {
  const columns: ColumnDef<UOM>[] = [
    {
      id: "uomCode",
      header: "Code",
      width: "w-[100px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.uomCode || "-"}</span>
      ),
    },
    {
      id: "uomName",
      header: "Name",
      accessorKey: "uomName",
    },
    {
      id: "description",
      header: "Description",
      hideOnMobile: true,
      cellClassName: "max-w-[200px] truncate text-muted-foreground",
      cell: (row) => row.description || "-",
    },
    {
      id: "uomCategory",
      header: "Category",
      cell: (row) => (
        <Badge variant="outline">
          {UOM_CATEGORY_LABELS[row.uomCategory] || "Unknown"}
        </Badge>
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

  const actions: RowAction<UOM>[] = [
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
      keyField="uomId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No units of measure found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
