"use client"

import { useState, useEffect } from "react"
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

import type { Role } from "@/types/iam/role"
import { useAllPermissions } from "@/hooks/iam/use-permissions"
import { useRolePermissions, useAssignRolePermissions, useRemoveRolePermissions } from "@/hooks/iam/use-roles"
import { PermissionPicker } from "@/components/settings/rbac/permission-picker"

interface RolePermissionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: Role | null
}

function RolePermissionsDialog({ open, onOpenChange, role }: RolePermissionsDialogProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [originalIds, setOriginalIds] = useState<Set<string>>(new Set())

    const roleId = role?.roleId || ""
    const { data: permissions, isLoading: permissionsLoading } = useAllPermissions()
    const { data: rolePermsData, isLoading: rolePermsLoading } = useRolePermissions(roleId)
    const assignMutation = useAssignRolePermissions()
    const removeMutation = useRemoveRolePermissions()

    // Populate selection from the role's existing permissions when the dialog opens.
    useEffect(() => {
        if (open && rolePermsData?.data) {
            const ids = new Set((rolePermsData.data || []).map((p) => p.permissionId))
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync selection + baseline from fetched data when dialog opens
            setSelectedIds(ids)
            setOriginalIds(ids)
        }
    }, [open, rolePermsData])

    const handleSave = async () => {
        if (!roleId) return

        const toAssign = [...selectedIds].filter((id) => !originalIds.has(id))
        const toRemove = [...originalIds].filter((id) => !selectedIds.has(id))

        try {
            if (toAssign.length > 0) {
                await assignMutation.mutateAsync({ roleId, permissionIds: toAssign })
            }
            if (toRemove.length > 0) {
                await removeMutation.mutateAsync({ roleId, permissionIds: toRemove })
            }
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update permissions:", error)
        }
    }

    const isPending = assignMutation.isPending || removeMutation.isPending
    const isLoading = permissionsLoading || rolePermsLoading
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
                    <DialogTitle>Manage Permissions</DialogTitle>
                    <DialogDescription>
                        Assign or remove permissions for role: <strong>{role?.roleName}</strong> ({role?.roleCode}).
                        Permissions are grouped by the page they belong to.
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
                            disabled={isPending}
                        />
                    </ScrollArea>
                )}

                <DialogFooter>
                    <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                        {selectedIds.size} permission(s) selected
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

export default RolePermissionsDialog
