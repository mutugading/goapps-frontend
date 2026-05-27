"use client"

import { useState, useEffect } from "react"
import { Loader2, Search } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

import {
    useMenuPermissions,
    useAssignMenuPermissions,
    useRemoveMenuPermissions,
} from "@/hooks/iam/use-menu"
import { usePermissions } from "@/hooks/iam/use-permissions"
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
    const [search, setSearch] = useState("")
    const [selected, setSelected] = useState<Set<string>>(new Set())

    const { data: menuPerms, isLoading: isLoadingPerms } = useMenuPermissions(menu?.menuId ?? "")
    const { data: allPermsData, isLoading: isLoadingAll } = usePermissions({ pageSize: 100 })
    const assign = useAssignMenuPermissions()
    const remove  = useRemoveMenuPermissions()

    const allPermissions: PermissionDetail[] = (allPermsData?.data ?? []) as PermissionDetail[]
    const currentPermIds: string[] = ((menuPerms as PermissionDetail[]) ?? []).map((p) => p.permissionId)

    // Sync selection to current menu permissions when dialog opens
    useEffect(() => {
        if (open && currentPermIds.length >= 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync selection state when dialog opens
            setSelected(new Set(currentPermIds))
        }
    }, [open, JSON.stringify(currentPermIds)]) // eslint-disable-line react-hooks/exhaustive-deps

    const filtered = allPermissions.filter((p) =>
        !search ||
        p.permissionCode.toLowerCase().includes(search.toLowerCase()) ||
        p.permissionName.toLowerCase().includes(search.toLowerCase())
    )

    const isLoading = isLoadingPerms || isLoadingAll
    const isPending = assign.isPending || remove.isPending

    function toggle(permId: string) {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(permId)) next.delete(permId)
            else next.add(permId)
            return next
        })
    }

    async function handleSave() {
        if (!menu) return

        const currentSet = new Set(currentPermIds)
        const toAdd    = [...selected].filter((id) => !currentSet.has(id))
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
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Manage Permissions</DialogTitle>
                    <DialogDescription>
                        Assign required permissions for{" "}
                        <strong>&quot;{menu?.menuTitle}&quot;</strong>. Users must have at least
                        one of these permissions to see this menu.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-8"
                            placeholder="Search permissions..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {selected.size > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {[...selected].map((id) => {
                                const perm = allPermissions.find((p) => p.permissionId === id)
                                return perm ? (
                                    <Badge
                                        key={id}
                                        variant="secondary"
                                        className="text-xs cursor-pointer"
                                        onClick={() => toggle(id)}
                                    >
                                        {perm.permissionCode} ×
                                    </Badge>
                                ) : null
                            })}
                        </div>
                    )}

                    <Separator />

                    <ScrollArea className="h-64 pr-2">
                        {isLoading ? (
                            <div className="flex h-32 items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filtered.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                No permissions found
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {filtered.map((perm) => (
                                    <div
                                        key={perm.permissionId}
                                        className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
                                        onClick={() => toggle(perm.permissionId)}
                                    >
                                        <Checkbox
                                            checked={selected.has(perm.permissionId)}
                                            onCheckedChange={() => toggle(perm.permissionId)}
                                            className="mt-0.5 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-mono leading-none">
                                                {perm.permissionCode}
                                            </p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {perm.permissionName}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
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
