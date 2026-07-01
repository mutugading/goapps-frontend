"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { groupPermissionsByMenu } from "@/lib/rbac/group-permissions"
import type { PermissionDetail } from "@/types/iam/role"

interface PermissionPickerProps {
    permissions: PermissionDetail[]
    // Selected permission IDs.
    value: Set<string>
    onChange: (next: Set<string>) => void
    // Permission IDs that are inherited (e.g. from roles) — shown checked and disabled.
    readOnlyIds?: Set<string>
    disabled?: boolean
}

/**
 * PermissionPicker renders permissions grouped by their owning page, with a
 * per-page select-all and a description under each permission. Shared by the
 * role assignment dialog and the direct user-permission dialog.
 */
export function PermissionPicker({
    permissions,
    value,
    onChange,
    readOnlyIds,
    disabled,
}: PermissionPickerProps) {
    const groups = useMemo(() => groupPermissionsByMenu(permissions), [permissions])

    if (permissions.length === 0) {
        return <p className="py-6 text-center text-sm text-muted-foreground">No permissions available.</p>
    }

    return (
        <div className="space-y-2">
            {groups.map((group) => (
                <PermissionGroupBlock
                    key={group.menuId ?? "__global__"}
                    title={group.menuTitle}
                    groupPermissions={group.permissions}
                    value={value}
                    onChange={onChange}
                    readOnlyIds={readOnlyIds}
                    disabled={disabled}
                />
            ))}
        </div>
    )
}

interface GroupBlockProps {
    title: string
    groupPermissions: PermissionDetail[]
    value: Set<string>
    onChange: (next: Set<string>) => void
    readOnlyIds?: Set<string>
    disabled?: boolean
}

function PermissionGroupBlock({
    title,
    groupPermissions,
    value,
    onChange,
    readOnlyIds,
    disabled,
}: GroupBlockProps) {
    const [open, setOpen] = useState(true)

    // Toggleable IDs exclude read-only (inherited) ones.
    const toggleableIds = groupPermissions
        .map((p) => p.permissionId)
        .filter((id) => !readOnlyIds?.has(id))
    const selectedCount = toggleableIds.filter((id) => value.has(id)).length
    const allSelected = toggleableIds.length > 0 && selectedCount === toggleableIds.length
    const someSelected = selectedCount > 0 && !allSelected
    const groupState: boolean | "indeterminate" = someSelected ? "indeterminate" : allSelected

    function toggleGroup(next: boolean) {
        const set = new Set(value)
        for (const id of toggleableIds) {
            if (next) set.add(id)
            else set.delete(id)
        }
        onChange(set)
    }

    function togglePermission(id: string, next: boolean) {
        const set = new Set(value)
        if (next) set.add(id)
        else set.delete(id)
        onChange(set)
    }

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="rounded-md border">
            <div className="flex items-center gap-2 px-3 py-2">
                <Checkbox
                    checked={groupState}
                    disabled={disabled || toggleableIds.length === 0}
                    onCheckedChange={(c) => toggleGroup(c === true)}
                    aria-label={`Select all in ${title}`}
                />
                <CollapsibleTrigger className="flex flex-1 items-center justify-between gap-2 text-left">
                    <span className="text-sm font-semibold">{title}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {selectedCount}/{toggleableIds.length}
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </span>
                </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
                <div className="divide-y border-t">
                    {groupPermissions.map((perm) => {
                        const inherited = readOnlyIds?.has(perm.permissionId) ?? false
                        const checked = inherited || value.has(perm.permissionId)
                        return (
                            <label
                                key={perm.permissionId}
                                className={cn(
                                    "flex cursor-pointer items-start gap-3 px-3 py-2",
                                    inherited && "cursor-not-allowed opacity-70"
                                )}
                            >
                                <Checkbox
                                    checked={checked}
                                    disabled={disabled || inherited}
                                    onCheckedChange={(c) => togglePermission(perm.permissionId, c === true)}
                                    className="mt-0.5"
                                />
                                <span className="flex min-w-0 flex-col">
                                    <span className="flex items-center gap-2">
                                        <span className="text-sm">{perm.permissionName}</span>
                                        <span className="font-mono text-xs text-muted-foreground">
                                            {perm.actionType}
                                        </span>
                                        {inherited && (
                                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                                                from role
                                            </span>
                                        )}
                                    </span>
                                    {perm.description ? (
                                        <span className="text-xs text-muted-foreground">{perm.description}</span>
                                    ) : null}
                                </span>
                            </label>
                        )
                    })}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
