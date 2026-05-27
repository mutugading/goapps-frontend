"use client"

import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { usePermissionContext } from "@/providers/permission-provider"

import type { EmployeeGroup } from "@/types/iam/employee-group"

interface EmployeeGroupTableProps {
  data: EmployeeGroup[]
  isLoading?: boolean
  onEdit: (employeeGroup: EmployeeGroup) => void
  onDelete: (employeeGroup: EmployeeGroup) => void
}

export function EmployeeGroupTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: EmployeeGroupTableProps) {
  const { hasPermission } = usePermissionContext()

  const canUpdate = hasPermission("iam.master.employeegroup.update")
  const canDelete = hasPermission("iam.master.employeegroup.delete")

  const columns: ColumnDef<EmployeeGroup>[] = [
    {
      id: "code",
      header: "Code",
      width: "w-[120px]",
      cell: (row) => (
        <span className="font-medium font-mono">{row.code || "-"}</span>
      ),
    },
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
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

  const actions: RowAction<EmployeeGroup>[] = []

  if (canUpdate) {
    actions.push({
      id: "edit",
      label: "Edit",
      icon: <Pencil className="h-4 w-4" />,
      onClick: onEdit,
    })
  }

  if (canDelete) {
    actions.push({
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: "destructive",
    })
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      keyField="employeeGroupId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No employee groups found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
