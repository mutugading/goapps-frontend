"use client"

import { ConfirmDialog } from "@/components/shared"
import type { MBHead } from "@/types/finance/mb-head"
import { useDeleteMBHead } from "@/hooks/finance/use-mb-head"

interface MBHeadDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mbHead: MBHead | null
  onSuccess?: () => void
}

export function MBHeadDeleteDialog({ open, onOpenChange, mbHead, onSuccess }: MBHeadDeleteDialogProps) {
  const deleteMutation = useDeleteMBHead()

  const handleDelete = async () => {
    if (!mbHead) return
    try {
      await deleteMutation.mutateAsync(mbHead.mbhId)
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
      title="Delete MB Head"
      description={`Delete MB Head "${mbHead?.mbhMbCosting}"? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
