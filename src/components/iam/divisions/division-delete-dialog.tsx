"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Division } from "@/types/iam/division"
import { useDeleteDivision } from "@/hooks/iam/use-division"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    division: Division | null
    onSuccess?: () => void
}

export function DivisionDeleteDialog({ open, onOpenChange, division, onSuccess }: Props) {
    const deleteMutation = useDeleteDivision()
    const handleDelete = async () => {
        if (!division) return
        try {
            await deleteMutation.mutateAsync(division.divisionId)
            onOpenChange(false)
            onSuccess?.()
        } catch (e) {
            console.error("Failed to delete division:", e)
        }
    }
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Division"
            description={`Are you sure you want to delete "${division?.divisionCode}" (${division?.divisionName})? This action cannot be undone.`}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            confirmText="Delete"
            onConfirm={handleDelete}
        />
    )
}
