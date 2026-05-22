"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Department } from "@/types/iam/department"
import { useDeleteDepartment } from "@/hooks/iam/use-departments"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    department: Department | null
    onSuccess?: () => void
}

export function DepartmentDeleteDialog({ open, onOpenChange, department, onSuccess }: Props) {
    const deleteMutation = useDeleteDepartment()
    const handleDelete = async () => {
        if (!department) return
        try {
            await deleteMutation.mutateAsync(department.departmentId)
            onOpenChange(false)
            onSuccess?.()
        } catch (e) {
            console.error("Failed to delete department:", e)
        }
    }
    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Department"
            description={`Are you sure you want to delete "${department?.departmentCode}" (${department?.departmentName})? This action cannot be undone.`}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            confirmText="Delete"
            onConfirm={handleDelete}
        />
    )
}
