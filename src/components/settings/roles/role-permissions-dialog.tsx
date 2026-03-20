"use client"

import { useState, useEffect } from "react"
import { Loader2, Check, ChevronRight } from "lucide-react"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

import type { Role } from "@/types/iam/role"
import { usePermissionsByService } from "@/hooks/iam/use-permissions"
import { useRolePermissions, useAssignRolePermissions, useRemoveRolePermissions } from "@/hooks/iam/use-roles"

interface RolePermissionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role: Role | null
}

function RolePermissionsDialog({ open, onOpenChange, role }: RolePermissionsDialogProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [originalIds, setOriginalIds] = useState<Set<string>>(new Set())
    const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())

    const roleId = role?.roleId || ""
    const { data: permissionsData, isLoading: permissionsLoading } = usePermissionsByService()
    const { data: rolePermsData, isLoading: rolePermsLoading } = useRolePermissions(roleId)
    const assignMutation = useAssignRolePermissions()
    const removeMutation = useRemoveRolePermissions()

    // Populate from existing role permissions
    useEffect(() => {
        if (open && rolePermsData?.data) {
            const ids = new Set((rolePermsData.data || []).map((p) => p.permissionId))
            setSelectedIds(ids)
            setOriginalIds(ids)
        }
    }, [open, rolePermsData])

    // Expand all services by default
    useEffect(() => {
        if (permissionsData?.data) {
            setExpandedServices(new Set(permissionsData.data.map((s) => s.serviceName)))
        }
    }, [permissionsData])

    const toggleService = (serviceName: string) => {
        setExpandedServices((prev) => {
            const next = new Set(prev)
            if (next.has(serviceName)) {
                next.delete(serviceName)
            } else {
                next.add(serviceName)
            }
            return next
        })
    }

    const togglePermission = (permissionId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(permissionId)) {
                next.delete(permissionId)
            } else {
                next.add(permissionId)
            }
            return next
        })
    }

    const toggleModule = (modulePermissionIds: string[]) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            const allSelected = modulePermissionIds.every((id) => next.has(id))
            if (allSelected) {
                modulePermissionIds.forEach((id) => next.delete(id))
            } else {
                modulePermissionIds.forEach((id) => next.add(id))
            }
            return next
        })
    }

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
    const services = permissionsData?.data || []
    const hasChanges = (() => {
        if (selectedIds.size !== originalIds.size) return true
        for (const id of selectedIds) {
            if (!originalIds.has(id)) return true
        }
        return false
    })()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Manage Permissions</DialogTitle>
                    <DialogDescription>
                        Assign or remove permissions for role: <strong>{role?.roleName}</strong> ({role?.roleCode})
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <ScrollArea className="max-h-[500px] pr-4">
                        <div className="space-y-3">
                            {services.map((service) => (
                                <Collapsible
                                    key={service.serviceName}
                                    open={expandedServices.has(service.serviceName)}
                                    onOpenChange={() => toggleService(service.serviceName)}
                                >
                                    <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-accent/50 transition-colors">
                                        <ChevronRight className={`h-4 w-4 transition-transform ${expandedServices.has(service.serviceName) ? "rotate-90" : ""}`} />
                                        <span className="font-semibold text-sm uppercase tracking-wide">{service.serviceName}</span>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="pl-6 space-y-2 mt-1">
                                        {(service.modules || []).map((module) => {
                                            const modulePermIds = (module.permissions || []).map((p) => p.permissionId)
                                            const allSelected = modulePermIds.every((id) => selectedIds.has(id))
                                            const someSelected = modulePermIds.some((id) => selectedIds.has(id))

                                            return (
                                                <div key={module.moduleName} className="space-y-1">
                                                    <label className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-accent/30">
                                                        <Checkbox
                                                            checked={allSelected ? true : (someSelected ? "indeterminate" : false)}
                                                            onCheckedChange={() => toggleModule(modulePermIds)}
                                                            disabled={isPending}
                                                        />
                                                        <span className="text-sm font-medium capitalize">{module.moduleName}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({modulePermIds.filter((id) => selectedIds.has(id)).length}/{modulePermIds.length})
                                                        </span>
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-1 pl-6">
                                                        {(module.permissions || []).map((perm) => {
                                                            // Extract entity from permission code (3rd segment: service.module.entity.action)
                                                            const codeParts = (perm.permissionCode || "").split(".")
                                                            const entity = codeParts.length >= 3 ? codeParts[2] : ""
                                                            // Show "entity > action" to distinguish permissions with same action under same module
                                                            const label = entity && entity !== module.moduleName
                                                                ? `${entity} : ${perm.actionType}`
                                                                : perm.actionType

                                                            return (
                                                                <label
                                                                    key={perm.permissionId}
                                                                    className="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-accent/30 text-sm"
                                                                >
                                                                    <Checkbox
                                                                        checked={selectedIds.has(perm.permissionId)}
                                                                        onCheckedChange={() => togglePermission(perm.permissionId)}
                                                                        disabled={isPending}
                                                                    />
                                                                    <span className="capitalize">{label}</span>
                                                                    {selectedIds.has(perm.permissionId) && (
                                                                        <Check className="h-3 w-3 text-primary ml-auto" />
                                                                    )}
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </CollapsibleContent>
                                </Collapsible>
                            ))}
                            {services.length === 0 && (
                                <p className="text-center text-muted-foreground py-4">No permissions available</p>
                            )}
                        </div>
                    </ScrollArea>
                )}

                <DialogFooter>
                    <div className="flex items-center gap-2 mr-auto text-sm text-muted-foreground">
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
