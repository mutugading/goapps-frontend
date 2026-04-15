"use client"

import { Pencil, Trash2, Send, CheckCircle2, Rocket, FastForward } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef, type RowAction } from "@/components/shared"
import { usePermissionContext } from "@/providers/permission-provider"

import {
  type EmployeeLevel,
  EMPLOYEE_LEVEL_TYPE_LABELS,
  EMPLOYEE_LEVEL_WORKFLOW_LABELS,
  EMPLOYEE_LEVEL_WORKFLOW_BADGE_VARIANT,
  EmployeeLevelWorkflow,
} from "@/types/iam/employee-level"

interface EmployeeLevelTableProps {
  data: EmployeeLevel[]
  isLoading?: boolean
  onEdit: (employeeLevel: EmployeeLevel) => void
  onDelete: (employeeLevel: EmployeeLevel) => void
  onSubmit: (employeeLevel: EmployeeLevel) => void
  onApprove: (employeeLevel: EmployeeLevel) => void
  onRelease: (employeeLevel: EmployeeLevel) => void
  onBypassRelease: (employeeLevel: EmployeeLevel) => void
}

export function EmployeeLevelTable({
  data,
  isLoading,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onRelease,
  onBypassRelease,
}: EmployeeLevelTableProps) {
  const { hasPermission } = usePermissionContext()

  const canSubmit = hasPermission("iam.master.employeelevel.submit")
  const canApprove = hasPermission("iam.master.employeelevel.approve")
  const canRelease = hasPermission("iam.master.employeelevel.release")
  const canBypass = hasPermission("iam.master.employeelevel.bypass")
  const canUpdate = hasPermission("iam.master.employeelevel.update")
  const canDelete = hasPermission("iam.master.employeelevel.delete")

  const columns: ColumnDef<EmployeeLevel>[] = [
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
      id: "grade",
      header: "Grade",
      width: "w-[80px]",
      cell: (row) => <span className="font-mono">{row.grade ?? 0}</span>,
    },
    {
      id: "type",
      header: "Type",
      hideOnMobile: true,
      cell: (row) => EMPLOYEE_LEVEL_TYPE_LABELS[row.type] ?? "-",
    },
    {
      id: "sequence",
      header: "Seq",
      width: "w-[80px]",
      hideOnMobile: true,
      cell: (row) => <span className="font-mono">{row.sequence ?? 0}</span>,
    },
    {
      id: "workflow",
      header: "Workflow",
      hideOnMobile: true,
      cell: (row) => (
        <Badge variant={EMPLOYEE_LEVEL_WORKFLOW_BADGE_VARIANT[row.workflow] ?? "outline"}>
          {EMPLOYEE_LEVEL_WORKFLOW_LABELS[row.workflow] ?? "-"}
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

  const actions: RowAction<EmployeeLevel>[] = []

  if (canSubmit) {
    actions.push({
      id: "submit",
      label: "Submit",
      icon: <Send className="h-4 w-4" />,
      onClick: onSubmit,
      disabled: (row) => row.workflow !== EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_DRAFT,
    })
  }

  if (canApprove) {
    actions.push({
      id: "approve",
      label: "Approve",
      icon: <CheckCircle2 className="h-4 w-4" />,
      onClick: onApprove,
      disabled: (row) => row.workflow !== EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_SUBMITTED,
    })
  }

  if (canRelease) {
    actions.push({
      id: "release",
      label: "Release",
      icon: <Rocket className="h-4 w-4" />,
      onClick: onRelease,
      disabled: (row) => row.workflow !== EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_APPROVED,
    })
  }

  if (canBypass) {
    actions.push({
      id: "bypass-release",
      label: "Bypass Release",
      icon: <FastForward className="h-4 w-4" />,
      onClick: onBypassRelease,
      disabled: (row) => row.workflow === EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_RELEASED,
    })
  }

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
      keyField="employeeLevelId"
      actions={actions}
      isLoading={isLoading}
      emptyMessage="No employee levels found"
      emptyDescription="Try adjusting your search or filter criteria"
    />
  )
}
