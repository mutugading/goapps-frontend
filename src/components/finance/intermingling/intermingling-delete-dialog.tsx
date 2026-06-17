"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Intermingling } from "@/types/finance/intermingling"
import { useDeleteIntermingling } from "@/hooks/finance/use-intermingling"

interface InterminglingDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  intermingling: Intermingling | null
  onSuccess?: () => void
}

export function InterminglingDeleteDialog({
  open,
  onOpenChange,
  intermingling,
  onSuccess,
}: InterminglingDeleteDialogProps) {
  const deleteMutation = useDeleteIntermingling()

  const handleDelete = async () => {
    if (!intermingling) return
    try {
      await deleteMutation.mutateAsync(intermingling.intmId)
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
      title="Delete Intermingling"
      description={`Delete "${intermingling?.intmCode} — ${intermingling?.intmName}"? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
