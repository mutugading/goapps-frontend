"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Role } from "@/types/iam/role"
import { useDeleteRole } from "@/hooks/iam/use-roles"

interface RoleDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: Role | null
    onSuccess?: () => void
}

export function RoleDeleteDialog({ open, onOpenChange, role, onSuccess }: RoleDeleteDialogProps) {
    const deleteMutation = useDeleteRole()

    const handleDelete = async () => {
        if (!role) return
        try {
            await deleteMutation.mutateAsync(role.roleId)
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to delete role:", error)
        }
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete Role"
            description={`Are you sure you want to delete the role "${role?.roleCode}" (${role?.roleName})? This will remove the role from all ${role?.userCount || 0} assigned users. This action cannot be undone.`}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            confirmText="Delete"
            onConfirm={handleDelete}
        />
    )
}
