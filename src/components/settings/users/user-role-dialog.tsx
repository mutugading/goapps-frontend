"use client"

import { useState, useEffect } from "react"
import { Loader2, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

import type { UserWithDetail } from "@/types/iam/user"
import { useRoles } from "@/hooks/iam/use-roles"
import { useAssignUserRoles, useRemoveUserRoles, useUserAccess } from "@/hooks/iam/use-users"

interface UserRoleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserWithDetail | null
}

export function UserRoleDialog({ open, onOpenChange, user }: UserRoleDialogProps) {
    const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set())
    const [originalRoleIds, setOriginalRoleIds] = useState<Set<string>>(new Set())

    const userId = user?.user?.userId || ""
    const { data: rolesData, isLoading: rolesLoading } = useRoles({ page: 1, pageSize: 100 })
    const { data: userAccess, isLoading: accessLoading } = useUserAccess(userId)
    const assignMutation = useAssignUserRoles()
    const removeMutation = useRemoveUserRoles()

    // Populate selected roles from user access data
    useEffect(() => {
        if (open && userAccess?.data) {
            const roleIds = new Set((userAccess.data.roles || []).map((r) => r.roleId))
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync state from fetched data when dialog opens
            setSelectedRoleIds(roleIds)
            setOriginalRoleIds(roleIds)
        }
    }, [open, userAccess])

    const handleToggleRole = (roleId: string) => {
        setSelectedRoleIds((prev) => {
            const next = new Set(prev)
            if (next.has(roleId)) {
                next.delete(roleId)
            } else {
                next.add(roleId)
            }
            return next
        })
    }

    const handleSave = async () => {
        if (!userId) return

        const toAssign = [...selectedRoleIds].filter((id) => !originalRoleIds.has(id))
        const toRemove = [...originalRoleIds].filter((id) => !selectedRoleIds.has(id))

        try {
            if (toAssign.length > 0) {
                await assignMutation.mutateAsync({ userId, roleIds: toAssign })
            }
            if (toRemove.length > 0) {
                await removeMutation.mutateAsync({ userId, roleIds: toRemove })
            }
            onOpenChange(false)
        } catch (error) {
            console.error("Failed to update roles:", error)
        }
    }

    const isPending = assignMutation.isPending || removeMutation.isPending
    const isLoading = rolesLoading || accessLoading
    const roles = rolesData?.data || []
    const hasChanges = (() => {
        if (selectedRoleIds.size !== originalRoleIds.size) return true
        for (const id of selectedRoleIds) {
            if (!originalRoleIds.has(id)) return true
        }
        return false
    })()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Manage Roles</DialogTitle>
                    <DialogDescription>
                        Assign or remove roles for {user?.detail?.fullName || user?.user?.username}
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <ScrollArea className="max-h-[400px] pr-4">
                        <div className="space-y-2">
                            {roles.map((role) => (
                                <label
                                    key={role.roleId}
                                    className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                                >
                                    <Checkbox
                                        checked={selectedRoleIds.has(role.roleId)}
                                        onCheckedChange={() => handleToggleRole(role.roleId)}
                                        disabled={isPending}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{role.roleName}</span>
                                            <Badge variant="outline" className="text-xs font-mono">
                                                {role.roleCode}
                                            </Badge>
                                            {role.isSystem && (
                                                <Badge variant="secondary" className="text-xs">System</Badge>
                                            )}
                                        </div>
                                        {role.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                {role.description}
                                            </p>
                                        )}
                                    </div>
                                    {selectedRoleIds.has(role.roleId) && (
                                        <Check className="h-4 w-4 text-primary shrink-0" />
                                    )}
                                </label>
                            ))}
                            {roles.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No roles available</p>
                            )}
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter>
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
