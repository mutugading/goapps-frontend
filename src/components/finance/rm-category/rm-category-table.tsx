"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { RMCategory } from "@/types/finance/rm-category"

interface RMCategoryTableProps {
  data: RMCategory[]
  isLoading?: boolean
  onEdit: (rmCategory: RMCategory) => void
  onDelete: (rmCategory: RMCategory) => void
}

export function RMCategoryTable({ data, isLoading, onEdit, onDelete }: RMCategoryTableProps) {
  const columns: ColumnDef<RMCategory>[] = [
    {
      id: "categoryCode",
      header: "Code",
      width: "w-[120px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.categoryCode || "-"}</span>
      ),
    },
    {
      id: "categoryName",
      header: "Name",
      accessorKey: "categoryName",
    },
    {
      id: "description",
      header: "Description",
      hideOnMobile: true,
      cellClassName: "max-w-[200px] truncate text-muted-foreground",
      cell: (row) => row.description || "-",
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

  const actions: RowAction<RMCategory>[] = [
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
      keyField="rmCategoryId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No raw material categories found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
