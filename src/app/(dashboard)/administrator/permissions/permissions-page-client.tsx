"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2 } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

import {
    PermissionFormDialog,
    PermissionDeleteDialog,
    PermissionFilters,
    PermissionTable,
    PermissionPagination,
} from "@/components/settings/permissions"

import { usePermissions } from "@/hooks/iam/use-permissions"
import { useUrlState } from "@/lib/hooks"
import {
    type PermissionDetail,
    type ListPermissionsParams,
    ActiveFilter,
} from "@/types/iam/role"

const defaultFilters: ListPermissionsParams = {
    page: 1,
    pageSize: 10,
    search: "",
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    actionType: "",
    sortBy: "code",
    sortOrder: "asc",
}

function PermissionsPageContent() {
    const [filters, setFilters] = useUrlState<ListPermissionsParams>({
        defaultValues: defaultFilters,
    })

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedPermission, setSelectedPermission] = useState<PermissionDetail | null>(null)

    const { data, isLoading } = usePermissions(filters)

    const handleCreate = () => {
        setSelectedPermission(null)
        setIsFormOpen(true)
    }

    const handleEdit = (permission: PermissionDetail) => {
        setSelectedPermission(permission)
        setIsFormOpen(true)
    }

    const handleDelete = (permission: PermissionDetail) => {
        setSelectedPermission(permission)
        setIsDeleteOpen(true)
    }

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page })
    }

    const handlePageSizeChange = (pageSize: number) => {
        setFilters({ ...filters, pageSize, page: 1 })
    }

    return (
        <>
            <PageHeader title="Permission Management" subtitle="Manage permissions for role-based access control." />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>
                            Total: {data?.pagination?.totalItems ?? 0} permissions
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Permission
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <PermissionFilters filters={filters} onFiltersChange={setFilters} />
                    <PermissionTable
                        data={data?.data ?? []}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    <PermissionPagination
                        pagination={data?.pagination}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </CardContent>
            </Card>

            <PermissionFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                permission={selectedPermission}
            />
            <PermissionDeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                permission={selectedPermission}
            />
        </>
    )
}

export default function PermissionsPageClient() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <PermissionsPageContent />
        </Suspense>
    )
}
