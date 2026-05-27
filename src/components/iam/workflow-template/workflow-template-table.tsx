"use client"

import { CheckCircle2, Pencil, Trash2, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import type { WorkflowTemplate } from "@/types/iam/workflow"

interface WorkflowTemplateTableProps {
  data: WorkflowTemplate[]
  isLoading?: boolean
  onEdit: (t: WorkflowTemplate) => void
  onDelete: (t: WorkflowTemplate) => void
  onActivate: (t: WorkflowTemplate) => void
}

const KIND_LABEL: Record<string, string> = {
  PRODUCT_COSTING: "Product Costing",
  PARAM_FILL: "Parameter Fill",
}

export function WorkflowTemplateTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onActivate,
}: WorkflowTemplateTableProps) {
  const columns: ColumnDef<WorkflowTemplate>[] = [
    {
      id: "kind",
      header: "Kind",
      width: "w-[160px]",
      cell: (row) => <span className="font-medium">{KIND_LABEL[row.kind] || row.kind}</span>,
    },
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
    },
    {
      id: "version",
      header: "Version",
      width: "w-[90px]",
      cell: (row) => <span className="font-mono">v{row.version}</span>,
    },
    {
      id: "steps",
      header: "Steps",
      width: "w-[80px]",
      cell: (row) => <span className="font-mono">{row.steps?.length ?? 0}</span>,
    },
    {
      id: "isActive",
      header: "Status",
      width: "w-[110px]",
      cell: (row) =>
        row.isActive ? (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" /> Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ]

  const actions: RowAction<WorkflowTemplate>[] = [
    {
      id: "activate",
      label: "Activate",
      icon: <Zap className="h-4 w-4" />,
      onClick: onActivate,
      disabled: (row) => row.isActive,
    },
    {
      id: "edit",
      label: "New version",
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
      keyField="templateId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No workflow templates yet"
      emptyDescription="Create one to define multi-step approvals."
    />
  )
}
