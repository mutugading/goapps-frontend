"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
    useMenuPermissions,
    useAssignMenuPermissions,
    useRemoveMenuPermissions,
} from "@/hooks/iam/use-menu"
import { useAllPermissions } from "@/hooks/iam/use-permissions"
import { PermissionPicker } from "@/components/settings/rbac/permission-picker"
import type { NormalizedMenuWithChildren } from "@/types/iam/menu"
import type { PermissionDetail } from "@/types/generated/iam/v1/role"

interface MenuPermissionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    menu: NormalizedMenuWithChildren | null
}

export function MenuPermissionDialog({
    open,
    onOpenChange,
    menu,
}: MenuPermissionDialogProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const { data: menuPerms, isLoading: isLoadingPerms } = useMenuPermissions(menu?.menuId ?? "")
    const { data: allPermissions, isLoading: isLoadingAll } = useAllPermissions()
    const assign = useAssignMenuPermissions()
    const remove = useRemoveMenuPermissions()

    const currentPermIds: string[] = ((menuPerms as PermissionDetail[]) ?? []).map((p) => p.permissionId)

    // Sync selection to current menu permissions when dialog opens.
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync selection state when dialog opens
            setSelected(new Set(currentPermIds))
        }
    }, [open, JSON.stringify(currentPermIds)]) // eslint-disable-line react-hooks/exhaustive-deps

    const isLoading = isLoadingPerms || isLoadingAll
    const isPending = assign.isPending || remove.isPending

    async function handleSave() {
        if (!menu) return

        const currentSet = new Set(currentPermIds)
        const toAdd = [...selected].filter((id) => !currentSet.has(id))
        const toRemove = currentPermIds.filter((id) => !selected.has(id))

        if (toAdd.length > 0) {
            await assign.mutateAsync({ menuId: menu.menuId, permissionIds: toAdd })
        }
        if (toRemove.length > 0) {
            await remove.mutateAsync({ menuId: menu.menuId, permissionIds: toRemove })
        }
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Manage Permissions</DialogTitle>
                    <DialogDescription>
                        Assign required permissions for <strong>&quot;{menu?.menuTitle}&quot;</strong>. Users must
                        have at least one of these permissions to see this menu. Permissions are grouped by the page
                        they belong to.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <ScrollArea className="max-h-[500px] pr-4">
                        <PermissionPicker
                            permissions={allPermissions}
                            value={selected}
                            onChange={setSelected}
                            disabled={isPending}
                        />
                    </ScrollArea>
                )}

                <DialogFooter>
                    <div className="mr-auto flex items-center gap-2 text-sm text-muted-foreground">
                        {selected.size} permission(s) selected
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Permissions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
