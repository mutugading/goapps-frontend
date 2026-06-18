"use client"

import { ConfirmDialog } from "@/components/shared"
import type { ProductGrade } from "@/types/finance/product-grade"
import { useDeleteProductGrade } from "@/hooks/finance/use-product-grade"

interface ProductGradeDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productGrade: ProductGrade | null
  onSuccess?: () => void
}

export function ProductGradeDeleteDialog({
  open,
  onOpenChange,
  productGrade,
  onSuccess,
}: ProductGradeDeleteDialogProps) {
  const deleteMutation = useDeleteProductGrade()

  const handleDelete = async () => {
    if (!productGrade) return
    try {
      await deleteMutation.mutateAsync(productGrade.pgId)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // toast handled in hook
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Product Grade"
      description={`Delete grade "${productGrade?.pgCode} — ${productGrade?.pgName}"? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
