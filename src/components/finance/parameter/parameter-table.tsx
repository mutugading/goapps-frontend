"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"

import type { Parameter } from "@/types/finance/parameter"
import { DATA_TYPE_LABELS, PARAM_CATEGORY_LABELS, DataType, ParamCategory } from "@/types/finance/parameter"

interface ParameterTableProps {
  data: Parameter[]
  isLoading?: boolean
  onEdit: (parameter: Parameter) => void
  onDelete: (parameter: Parameter) => void
}

export function ParameterTable({ data, isLoading, onEdit, onDelete }: ParameterTableProps) {
  const columns: ColumnDef<Parameter>[] = [
    {
      id: "paramCode",
      header: "Code",
      width: "w-[130px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.paramCode || "-"}</span>
      ),
    },
    {
      id: "paramName",
      header: "Name",
      accessorKey: "paramName",
    },
    {
      id: "paramShortName",
      header: "Short Name",
      hideOnMobile: true,
      cell: (row) => row.paramShortName || "-",
    },
    {
      id: "dataType",
      header: "Data Type",
      cell: (row) => (
        <Badge variant="outline">
          {DATA_TYPE_LABELS[row.dataType] || DATA_TYPE_LABELS[DataType.UNRECOGNIZED]}
        </Badge>
      ),
    },
    {
      id: "paramCategory",
      header: "Category",
      cell: (row) => (
        <Badge variant="secondary">
          {PARAM_CATEGORY_LABELS[row.paramCategory] || PARAM_CATEGORY_LABELS[ParamCategory.UNRECOGNIZED]}
        </Badge>
      ),
    },
    {
      id: "uomCode",
      header: "UOM",
      hideOnMobile: true,
      cell: (row) => row.uomCode ? (
        <span className="text-muted-foreground" title={row.uomName}>
          {row.uomCode}
        </span>
      ) : "-",
    },
    {
      id: "defaultValue",
      header: "Default",
      hideOnMobile: true,
      cell: (row) => row.defaultValue || "-",
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

  const actions: RowAction<Parameter>[] = [
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
      keyField="paramId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No parameters found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
