"use client"

import { ConfirmDialog } from "@/components/shared"
import type { CMSPage } from "@/types/iam/cms-page"
import { useDeleteCMSPage } from "@/hooks/iam/use-cms-page"

interface CMSPageDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  page: CMSPage | null
  onSuccess?: () => void
}

export function CMSPageDeleteDialog({
  open,
  onOpenChange,
  page,
  onSuccess,
}: CMSPageDeleteDialogProps) {
  const deleteMutation = useDeleteCMSPage()

  const handleDelete = async () => {
    if (!page) return

    try {
      await deleteMutation.mutateAsync(page.pageId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete CMS Page:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete CMS Page"
      description={`Are you sure you want to delete the page "${page?.pageSlug}" (${page?.pageTitle})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
