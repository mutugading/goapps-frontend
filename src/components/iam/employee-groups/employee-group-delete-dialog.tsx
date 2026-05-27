"use client"

import { ConfirmDialog } from "@/components/shared"
import type { EmployeeGroup } from "@/types/iam/employee-group"
import { useDeleteEmployeeGroup } from "@/hooks/iam/use-employee-group"

interface EmployeeGroupDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeGroup: EmployeeGroup | null
  onSuccess?: () => void
}

export function EmployeeGroupDeleteDialog({
  open,
  onOpenChange,
  employeeGroup,
  onSuccess,
}: EmployeeGroupDeleteDialogProps) {
  const deleteMutation = useDeleteEmployeeGroup()

  const handleDelete = async () => {
    if (!employeeGroup) return

    try {
      await deleteMutation.mutateAsync(employeeGroup.employeeGroupId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete Employee Group:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Employee Group"
      description={`Are you sure you want to delete the employee group "${employeeGroup?.code}" (${employeeGroup?.name})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
