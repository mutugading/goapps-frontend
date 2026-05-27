"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Parameter } from "@/types/finance/parameter"
import { useDeleteParameter } from "@/hooks/finance/use-parameter"

interface ParameterDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parameter: Parameter | null
  onSuccess?: () => void
}

export function ParameterDeleteDialog({
  open,
  onOpenChange,
  parameter,
  onSuccess,
}: ParameterDeleteDialogProps) {
  const deleteMutation = useDeleteParameter()

  const handleDelete = async () => {
    if (!parameter) return

    try {
      await deleteMutation.mutateAsync(parameter.paramId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete Parameter:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Parameter"
      description={`Are you sure you want to delete the parameter "${parameter?.paramCode}" (${parameter?.paramName})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
