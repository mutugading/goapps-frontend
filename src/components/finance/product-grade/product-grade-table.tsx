"use client"

import { Pencil, Trash2 } from "lucide-react"

import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { StatusBadge } from "@/components/common"

import type { ProductGrade } from "@/types/finance/product-grade"

interface ProductGradeTableProps {
  data: ProductGrade[]
  isLoading?: boolean
  onEdit: (productGrade: ProductGrade) => void
  onDelete: (productGrade: ProductGrade) => void
}

export function ProductGradeTable({ data, isLoading, onEdit, onDelete }: ProductGradeTableProps) {
  const columns: ColumnDef<ProductGrade>[] = [
    {
      id: "pgCode",
      header: "Code",
      width: "w-[100px]",
      cell: (row) => <span className="font-medium font-mono">{row.pgCode || "-"}</span>,
    },
    {
      id: "pgName",
      header: "Name",
      accessorKey: "pgName",
    },
    {
      id: "bcPerc",
      header: "BC %",
      width: "w-[90px]",
      cell: (row) => `${row.bcPerc?.toFixed(2)}%`,
    },
    {
      id: "nonStdPerc",
      header: "Non-Std %",
      width: "w-[100px]",
      hideOnMobile: true,
      cell: (row) => `${row.nonStdPerc?.toFixed(2)}%`,
    },
    {
      id: "bcRecoveryRate",
      header: "BC Recovery",
      width: "w-[110px]",
      hideOnMobile: true,
      cell: (row) => `${((row.bcRecoveryRate ?? 0) * 100).toFixed(1)}%`,
    },
    {
      id: "pgDetailProduct",
      header: "Detail Pattern",
      hideOnMobile: true,
      cell: (row) => row.pgDetailProduct || <span className="text-muted-foreground">—</span>,
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

  const actions: RowAction<ProductGrade>[] = [
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
      tableId="yarn-master-product-grades"
      data={data}
      columns={columns}
      keyField="pgId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No product grades found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
