"use client"

import { ConfirmDialog } from "@/components/shared"
import type { CMSSection } from "@/types/iam/cms-section"
import { useDeleteCMSSection } from "@/hooks/iam/use-cms-section"

interface CMSSectionDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: CMSSection | null
  onSuccess?: () => void
}

export function CMSSectionDeleteDialog({
  open,
  onOpenChange,
  section,
  onSuccess,
}: CMSSectionDeleteDialogProps) {
  const deleteMutation = useDeleteCMSSection()

  const handleDelete = async () => {
    if (!section) return

    try {
      await deleteMutation.mutateAsync(section.sectionId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete CMS Section:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete CMS Section"
      description={`Are you sure you want to delete the section "${section?.sectionKey}" (${section?.title})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
