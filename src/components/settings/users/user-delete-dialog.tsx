"use client"

import { ConfirmDialog } from "@/components/shared"
import type { UserWithDetail } from "@/types/iam/user"
import { useDeleteUser } from "@/hooks/iam/use-users"

interface UserDeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserWithDetail | null
    onSuccess?: () => void
}

export function UserDeleteDialog({
    open,
    onOpenChange,
    user,
    onSuccess,
}: UserDeleteDialogProps) {
    const deleteMutation = useDeleteUser()

    const handleDelete = async () => {
        if (!user?.user) return

        try {
            await deleteMutation.mutateAsync(user.user.userId)
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error("Failed to delete user:", error)
        }
    }

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Delete User"
            description={`Are you sure you want to delete user "${user?.user?.username}" (${user?.detail?.fullName})? This action cannot be undone.`}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            confirmText="Delete"
            onConfirm={handleDelete}
        />
    )
}
