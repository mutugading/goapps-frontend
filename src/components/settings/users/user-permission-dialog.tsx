"use client"

import { useMemo, useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { UserWithDetail } from "@/types/iam/user"
import { usePermissions } from "@/hooks/iam/use-permissions"
import { useAssignUserPermissions, useRemoveUserPermissions, useUserAccess } from "@/hooks/iam/use-users"
import { PermissionPicker } from "@/components/settings/rbac/permission-picker"

interface UserPermissionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserWithDetail | null
}

// ALL_PERMISSIONS_PAGE_SIZE fetches the full permission catalog in one page for the picker.
const ALL_PERMISSIONS_PAGE_SIZE = 500

export function UserPermissionDialog({ open, onOpenChange, user }: UserPermissionDialogProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [originalIds, setOriginalIds] = useState<Set<string>>(new Set())

    const userId = user?.user?.userId || ""
    const { data: permissionsData, isLoading: permissionsLoading } = usePermissions({
        page: 1,
        pageSize: ALL_PERMISSIONS_PAGE_SIZE,
    })
    const { data: userAccess, isLoading: accessLoading } = useUserAccess(userId)
    const assignMutation = useAssignUserPermissions()
    const removeMutation = useRemoveUserPermissions()

    // Permission IDs granted via roles — shown checked and read-only in the picker.
    const roleInheritedIds = useMemo(() => {
        const set = new Set<string>()
        for (const role of userAccess?.data?.roles ?? []) {
            for (const perm of role.permissions ?? []) {
                set.add(perm.permissionId)
            }
        }
        return set
    }, [userAccess])

    // Populate direct-permission selection when the dialog opens.
    useEffect(() => {
        if (open && userAccess?.data) {
            const ids = new Set((userAccess.data.directPermissions || []).map((p) => p.permissionId))
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync selection + baseline from fetched data when dialog opens
            setSelectedIds(ids)
            setOriginalIds(ids)
        }
    }, [open, userAccess])

    const handleSave = async () => {
        if (!userId) return

        const toAssign = [...selectedIds].filter((id) => !originalIds.has(id))
        const toRemove = [...originalIds].filter((id) => !selectedIds.has(id))

        try {
            if (toAssign.length > 0) {
                await assignMutation.mutateAsync({ userId, permissionIds: toAssign })
            }
            if (toRemove.length > 0) {
                await removeMutation.mutateAsync({ userId, permissionIds: toRemove })
            }
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update permissions:", error)
        }
    }

    const isPending = assignMutation.isPending || removeMutation.isPending
    const isLoading = permissionsLoading || accessLoading
    const permissions = permissionsData?.data ?? []
    const displayName = user?.detail?.fullName || user?.user?.username || "user"
    const hasChanges = (() => {
        if (selectedIds.size !== originalIds.size) return true
        for (const id of selectedIds) {
            if (!originalIds.has(id)) return true
        }
        return false
    })()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Manage Direct Permissions</DialogTitle>
                    <DialogDescription>
                        Grant permissions directly to <strong>{displayName}</strong>, without creating a role.
                        Permissions already granted through a role are shown checked and marked{" "}
                        <span className="font-medium">from role</span>.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <ScrollArea className="max-h-[500px] pr-4">
                        <PermissionPicker
                            permissions={permissions}
                            value={selectedIds}
                            onChange={setSelectedIds}
                            readOnlyIds={roleInheritedIds}
                            disabled={isPending}
                        />
                    </ScrollArea>
                )}

                <DialogFooter>
                    <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                        {selectedIds.size} direct permission(s)
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending || !hasChanges}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
