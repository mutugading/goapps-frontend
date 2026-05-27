"use client"

import { ConfirmDialog } from "@/components/shared"
import type { UOMCategory } from "@/types/finance/uom-category"
import { useDeleteUOMCategory } from "@/hooks/finance/use-uom-category"

interface UOMCategoryDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uomCategory: UOMCategory | null
  onSuccess?: () => void
}

export function UOMCategoryDeleteDialog({
  open,
  onOpenChange,
  uomCategory,
  onSuccess,
}: UOMCategoryDeleteDialogProps) {
  const deleteMutation = useDeleteUOMCategory()

  const handleDelete = async () => {
    if (!uomCategory) return

    try {
      await deleteMutation.mutateAsync(uomCategory.uomCategoryId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete UOM Category:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete UOM Category"
      description={`Are you sure you want to delete the category "${uomCategory?.categoryCode}" (${uomCategory?.categoryName})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
