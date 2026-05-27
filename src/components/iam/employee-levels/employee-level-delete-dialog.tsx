"use client"

import { ConfirmDialog } from "@/components/shared"
import type { EmployeeLevel } from "@/types/iam/employee-level"
import { useDeleteEmployeeLevel } from "@/hooks/iam/use-employee-level"

interface EmployeeLevelDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeLevel: EmployeeLevel | null
  onSuccess?: () => void
}

export function EmployeeLevelDeleteDialog({
  open,
  onOpenChange,
  employeeLevel,
  onSuccess,
}: EmployeeLevelDeleteDialogProps) {
  const deleteMutation = useDeleteEmployeeLevel()

  const handleDelete = async () => {
    if (!employeeLevel) return

    try {
      await deleteMutation.mutateAsync(employeeLevel.employeeLevelId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete Employee Level:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Employee Level"
      description={`Are you sure you want to delete the employee level "${employeeLevel?.code}" (${employeeLevel?.name})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
