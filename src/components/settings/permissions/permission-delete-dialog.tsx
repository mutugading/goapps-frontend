"use client"

import { ConfirmDialog } from "@/components/shared"
import type { PermissionDetail } from "@/types/iam/role"
import { useDeletePermission } from "@/hooks/iam/use-permissions"

interface PermissionDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    permission: PermissionDetail | null
}

export function PermissionDeleteDialog({ open, onOpenChange, permission }: PermissionDeleteDialogProps) {
    const deleteMutation = useDeletePermission()

    const handleDelete = async () => {
        if (!permission) return
        try {
            await deleteMutation.mutateAsync(permission.permissionId)
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to delete permission:", error)
        }
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Permission"
            description={`Are you sure you want to delete the permission "${permission?.permissionCode}" (${permission?.permissionName})? This will remove it from ${permission?.roleCount || 0} roles. This action cannot be undone.`}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            confirmText="Delete"
            onConfirm={handleDelete}
        />
    )
}
