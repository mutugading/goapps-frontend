"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { DebouncedSearchInput } from "@/components/common/debounced-search-input"

import { useAllPermissions } from "@/hooks/iam/use-permissions"
import { groupPermissionsByMenu } from "@/lib/rbac/group-permissions"
import type { PermissionDetail } from "@/types/iam/role"

function matches(perm: PermissionDetail, q: string): boolean {
    if (!q) return true
    const needle = q.toLowerCase()
    return (
        perm.permissionCode.toLowerCase().includes(needle) ||
        perm.permissionName.toLowerCase().includes(needle) ||
        (perm.description?.toLowerCase().includes(needle) ?? false) ||
        (perm.menuTitle?.toLowerCase().includes(needle) ?? false)
    )
}

export default function PermissionCatalogClient() {
    const [search, setSearch] = useState("")
    const { data: all, isLoading } = useAllPermissions()

    const groups = useMemo(() => {
        const filtered = search ? all.filter((p) => matches(p, search)) : all
        return groupPermissionsByMenu(filtered)
    }, [all, search])

    return (
        <div className="space-y-6">
            <PageHeader
                title="Permission Catalog"
                subtitle="Browse every permission grouped by the page it belongs to, with a description of what it does."
            >
                <Button variant="outline" asChild>
                    <Link href="/administrator/permissions">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to management
                    </Link>
                </Button>
            </PageHeader>

            <DebouncedSearchInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search by page, permission name, code, or description…"
                className="max-w-md"
            />

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : groups.length === 0 ? (
                <EmptyState title="No permissions found" description="Try a different search term." />
            ) : (
                <div className="space-y-4">
                    {groups.map((group) => (
                        <Card key={group.menuId ?? "__global__"}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-semibold">{group.menuTitle}</CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    {group.permissions.length} permission(s)
                                </span>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {group.permissions.map((perm) => (
                                    <div
                                        key={perm.permissionId}
                                        className="flex flex-col gap-1 border-b pb-2 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                                    >
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{perm.permissionName}</span>
                                                <Badge variant="secondary" className="font-mono text-[10px] font-normal">
                                                    {perm.actionType}
                                                </Badge>
                                            </div>
                                            <p className="font-mono text-xs text-muted-foreground">
                                                {perm.permissionCode}
                                            </p>
                                            {perm.description ? (
                                                <p className="text-xs text-muted-foreground">{perm.description}</p>
                                            ) : null}
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {perm.roleCount} role(s)
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
