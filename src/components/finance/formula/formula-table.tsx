"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import { type Formula, FORMULA_TYPE_LABELS } from "@/types/finance/formula"

interface FormulaTableProps {
  data: Formula[]
  isLoading?: boolean
  onEdit: (formula: Formula) => void
  onDelete: (formula: Formula) => void
}

export function FormulaTable({ data, isLoading, onEdit, onDelete }: FormulaTableProps) {
  const columns: ColumnDef<Formula>[] = [
    {
      id: "formulaCode",
      header: "Code",
      width: "w-[140px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.formulaCode || "-"}</span>
      ),
    },
    {
      id: "formulaName",
      header: "Name",
      accessorKey: "formulaName",
    },
    {
      id: "formulaType",
      header: "Type",
      cell: (row) => (
        <Badge variant="outline">
          {FORMULA_TYPE_LABELS[row.formulaType] || "Unknown"}
        </Badge>
      ),
    },
    {
      id: "expression",
      header: "Expression",
      hideOnMobile: true,
      cellClassName: "max-w-[200px] truncate text-muted-foreground font-mono text-xs",
      cell: (row) => row.expression || "-",
    },
    {
      id: "resultParamCode",
      header: "Result Param",
      hideOnMobile: true,
      cell: (row) => (
        <span className="font-mono text-xs">{row.resultParamCode || "-"}</span>
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

  const actions: RowAction<Formula>[] = [
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
      keyField="formulaId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No formulas found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
