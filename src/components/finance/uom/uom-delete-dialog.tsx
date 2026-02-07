"use client"

import { ConfirmDialog } from "@/components/shared"
import type { UOM } from "@/types/finance/uom"
import { useDeleteUOM } from "@/hooks/finance/use-uom"

interface UOMDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uom: UOM | null
  onSuccess?: () => void
}

export function UOMDeleteDialog({
  open,
  onOpenChange,
  uom,
  onSuccess,
}: UOMDeleteDialogProps) {
  const deleteMutation = useDeleteUOM()

  const handleDelete = async () => {
    if (!uom) return

    try {
      await deleteMutation.mutateAsync(uom.uomId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete UOM:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Unit of Measure"
      description={`Are you sure you want to delete the UOM "${uom?.uomCode}" (${uom?.uomName})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
