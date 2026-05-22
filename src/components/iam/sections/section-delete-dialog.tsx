"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Section } from "@/types/iam/section"
import { useDeleteSection } from "@/hooks/iam/use-section"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    section: Section | null
    onSuccess?: () => void
}

export function SectionDeleteDialog({ open, onOpenChange, section, onSuccess }: Props) {
    const deleteMutation = useDeleteSection()
    const handleDelete = async () => {
        if (!section) return
        try {
            await deleteMutation.mutateAsync(section.sectionId)
            onOpenChange(false)
            onSuccess?.()
        } catch (e) {
            console.error("Failed to delete section:", e)
        }
    }
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Section"
            description={`Are you sure you want to delete "${section?.sectionCode}" (${section?.sectionName})? This action cannot be undone.`}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            confirmText="Delete"
            onConfirm={handleDelete}
        />
    )
}
