"use client"

import { ConfirmDialog } from "@/components/shared"
import type { CompanyMapping } from "@/types/iam/company-mapping"
import { useDeleteCompanyMapping } from "@/hooks/iam/use-company-mapping"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    mapping: CompanyMapping | null
    onSuccess?: () => void
}

export function CompanyMappingDeleteDialog({ open, onOpenChange, mapping, onSuccess }: Props) {
    const deleteMutation = useDeleteCompanyMapping()
    const handleDelete = async () => {
        if (!mapping) return
        try {
            await deleteMutation.mutateAsync(mapping.companyMappingId)
            onOpenChange(false)
            onSuccess?.()
        } catch (e) {
            console.error("Failed to delete mapping:", e)
        }
    }
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Company Mapping"
            description={`Are you sure you want to delete "${mapping?.code}" (${mapping?.name})? This action cannot be undone.`}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            confirmText="Delete"
            onConfirm={handleDelete}
        />
    )
}
