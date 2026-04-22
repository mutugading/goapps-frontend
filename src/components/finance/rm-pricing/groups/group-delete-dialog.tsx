"use client"

import { ConfirmDialog } from "@/components/shared"
import type { RMGroupHead } from "@/types/finance/rm-group"
import { useDeleteRMGroup } from "@/hooks/finance/use-rm-group"

interface GroupDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  group: RMGroupHead | null
  onSuccess?: () => void
}

export function GroupDeleteDialog({
  open,
  onOpenChange,
  group,
  onSuccess,
}: GroupDeleteDialogProps) {
  const deleteMutation = useDeleteRMGroup()

  const handleDelete = async () => {
    if (!group) return

    try {
      await deleteMutation.mutateAsync(group.groupHeadId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete RM Group:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete RM Group"
      description={`Are you sure you want to delete the group "${group?.groupCode}" (${group?.groupName})? This action cannot be undone. Groups with existing cost rows may be restricted from deletion.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
