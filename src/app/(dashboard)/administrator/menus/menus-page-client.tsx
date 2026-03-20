"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2, RefreshCw } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

import { MenuTreeView } from "@/components/iam/menus/menu-tree-view"
import { MenuFormDialog } from "@/components/iam/menus/menu-form-dialog"
import { MenuDeleteDialog } from "@/components/iam/menus/menu-delete-dialog"
import { MenuPermissionDialog } from "@/components/iam/menus/menu-permission-dialog"

import { useFullMenuTree } from "@/hooks/iam/use-menu"
import type { NormalizedMenuWithChildren } from "@/types/iam/menu"
import { useQueryClient } from "@tanstack/react-query"
import { menuKeys } from "@/hooks/iam/use-menu"

// ---------------------------------------------------------------------------

function MenusPageContent() {
    const queryClient = useQueryClient()
    const { data: menuTree = [], isLoading, isFetching } = useFullMenuTree({
        includeInactive: true,
        includeHidden:   true,
    })

    const [isFormOpen,        setIsFormOpen]        = useState(false)
    const [isDeleteOpen,      setIsDeleteOpen]      = useState(false)
    const [isPermissionOpen,  setIsPermissionOpen]  = useState(false)
    const [selectedMenu,      setSelectedMenu]      = useState<NormalizedMenuWithChildren | null>(null)
    const [parentMenu,        setParentMenu]        = useState<NormalizedMenuWithChildren | null>(null)

    function handleCreateRoot() {
        setSelectedMenu(null)
        setParentMenu(null)
        setIsFormOpen(true)
    }

    function handleAddChild(parent: NormalizedMenuWithChildren) {
        setSelectedMenu(null)
        setParentMenu(parent)
        setIsFormOpen(true)
    }

    function handleEdit(menu: NormalizedMenuWithChildren) {
        setSelectedMenu(menu)
        setParentMenu(null)
        setIsFormOpen(true)
    }

    function handleDelete(menu: NormalizedMenuWithChildren) {
        setSelectedMenu(menu)
        setIsDeleteOpen(true)
    }

    function handleManagePermissions(menu: NormalizedMenuWithChildren) {
        setSelectedMenu(menu)
        setIsPermissionOpen(true)
    }

    function handleRefresh() {
        queryClient.invalidateQueries({ queryKey: menuKeys.all() })
    }

    return (
        <>
            <PageHeader
                title="Menu Management"
                subtitle="Manage sidebar navigation menus. Changes take effect immediately for all users."
            />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Menu Tree</CardTitle>
                        <CardDescription>
                            {menuTree.length} root menu{menuTree.length !== 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button size="sm" onClick={handleCreateRoot}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Root Menu
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Column headers */}
                    <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium text-muted-foreground">
                        <span className="w-5" />
                        <span className="w-5" />
                        <span className="flex-1">Title / URL</span>
                        <span className="hidden md:inline-block w-40">Code</span>
                        <span className="hidden sm:inline-block w-14">Level</span>
                        <span className="hidden lg:inline-block w-6 text-right">Order</span>
                        <span className="w-[116px]" />
                    </div>

                    {isLoading ? (
                        <div className="space-y-2 py-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-2 px-2">
                                    <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <MenuTreeView
                            menus={menuTree}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onAddChild={handleAddChild}
                            onManagePermissions={handleManagePermissions}
                        />
                    )}
                </CardContent>
            </Card>

            <MenuFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                menu={selectedMenu}
                parentMenu={parentMenu}
            />
            <MenuDeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                menu={selectedMenu}
            />
            <MenuPermissionDialog
                open={isPermissionOpen}
                onOpenChange={setIsPermissionOpen}
                menu={selectedMenu}
            />
        </>
    )
}

// ---------------------------------------------------------------------------

export default function MenusPageClient() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <MenusPageContent />
        </Suspense>
    )
}
