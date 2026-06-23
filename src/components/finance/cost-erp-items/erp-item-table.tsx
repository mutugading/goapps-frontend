"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { CostErpItem } from "@/types/finance/cost-erp"

interface ErpItemTableProps {
  data: CostErpItem[]
  isLoading?: boolean
  onEdit: (item: CostErpItem) => void
  onDelete: (item: CostErpItem) => void
}

export function ErpItemTable({ data, isLoading, onEdit, onDelete }: ErpItemTableProps) {
  const columns: ColumnDef<CostErpItem>[] = [
    {
      id: "itemCode",
      header: "Code",
      width: "w-[140px]",
      cell: (row) => (
        <span className="font-medium font-mono text-sm">{row.itemCode || "-"}</span>
      ),
    },
    {
      id: "itemName",
      header: "Name",
      accessorKey: "itemName",
    },
    {
      id: "itemType",
      header: "Type",
      width: "w-[100px]",
      cell: (row) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.itemType || "-"}
        </Badge>
      ),
    },
    {
      id: "isActive",
      header: "Status",
      width: "w-[100px]",
      cell: (row) => (
        <Badge variant={row.isActive ? "default" : "secondary"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "syncedAt",
      header: "Last Synced",
      hideOnMobile: true,
      cellClassName: "text-muted-foreground text-xs",
      cell: (row) => {
        if (!row.syncedAt) return "-"
        try {
          return new Date(row.syncedAt).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        } catch {
          return row.syncedAt
        }
      },
    },
  ]

  const actions: RowAction<CostErpItem>[] = [
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
      keyField="itemId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No ERP items found"
      emptyDescription="Try adjusting your search or filter criteria, or add a new ERP item."
    />
  )
}
