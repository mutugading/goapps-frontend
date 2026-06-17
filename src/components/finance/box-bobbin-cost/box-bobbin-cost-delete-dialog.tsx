"use client"

import { ConfirmDialog } from "@/components/shared"
import type { BoxBobbinCost } from "@/types/finance/box-bobbin-cost"
import { useDeleteBoxBobbinCost } from "@/hooks/finance/use-box-bobbin-cost"

interface BoxBobbinCostDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  boxBobbinCost: BoxBobbinCost | null
  onSuccess?: () => void
}

export function BoxBobbinCostDeleteDialog({
  open,
  onOpenChange,
  boxBobbinCost,
  onSuccess,
}: BoxBobbinCostDeleteDialogProps) {
  const deleteMutation = useDeleteBoxBobbinCost()

  const handleDelete = async () => {
    if (!boxBobbinCost) return

    try {
      await deleteMutation.mutateAsync(String(boxBobbinCost.bbcId))
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete Box Bobbin Cost:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Box Bobbin Cost"
      description={`Are you sure you want to delete "${boxBobbinCost?.bbcCode}" (${boxBobbinCost?.bbcName})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
