"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Company } from "@/types/iam/company"
import { useDeleteCompany } from "@/hooks/iam/use-company"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    company: Company | null
    onSuccess?: () => void
}

export function CompanyDeleteDialog({ open, onOpenChange, company, onSuccess }: Props) {
    const deleteMutation = useDeleteCompany()
    const handleDelete = async () => {
        if (!company) return
        try {
            await deleteMutation.mutateAsync(company.companyId)
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to delete company:", error)
        }
    }
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Company"
            description={`Are you sure you want to delete "${company?.companyCode}" (${company?.companyName})? This action cannot be undone.`}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            confirmText="Delete"
            onConfirm={handleDelete}
        />
    )
}
