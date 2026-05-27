"use client"

import { ConfirmDialog } from "@/components/shared"
import type { RMCategory } from "@/types/finance/rm-category"
import { useDeleteRMCategory } from "@/hooks/finance/use-rm-category"

interface RMCategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rmCategory: RMCategory | null
  onSuccess?: () => void
}

export function RMCategoryDeleteDialog({
  open,
  onOpenChange,
  rmCategory,
  onSuccess,
}: RMCategoryDeleteDialogProps) {
  const deleteMutation = useDeleteRMCategory()

  const handleDelete = async () => {
    if (!rmCategory) return

    try {
      await deleteMutation.mutateAsync(rmCategory.rmCategoryId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete RM Category:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Raw Material Category"
      description={`Are you sure you want to delete the category "${rmCategory?.categoryCode}" (${rmCategory?.categoryName})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
