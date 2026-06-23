"use client"

import { ConfirmDialog } from "@/components/shared"
import type { CostErpItem } from "@/types/finance/cost-erp"
import { useDeleteErpItem } from "@/hooks/finance/use-cost-erp"

interface ErpItemDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CostErpItem | null
  onSuccess?: () => void
}

export function ErpItemDeleteDialog({
  open,
  onOpenChange,
  item,
  onSuccess,
}: ErpItemDeleteDialogProps) {
  const deleteMutation = useDeleteErpItem()

  const handleDelete = async () => {
    if (!item) return
    try {
      await deleteMutation.mutateAsync(item.itemId)
      onOpenChange(false)
      onSuccess?.()
    } catch {
      // toast is handled inside the mutation hook
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete ERP Item"
      description={`Are you sure you want to delete the item "${item?.itemCode}"${item?.itemName ? ` (${item.itemName})` : ""}? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
