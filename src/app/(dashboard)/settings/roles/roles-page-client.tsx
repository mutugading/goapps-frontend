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
    RoleFormDialog,
    RoleDeleteDialog,
    RoleFilters,
    RoleTable,
    RolePagination,
    RolePermissionsDialog,
} from "@/components/settings/roles"

import { useRoles } from "@/hooks/iam/use-roles"
import { useUrlState } from "@/lib/hooks"
import {
    type Role,
    type ListRolesParams,
    ActiveFilter,
} from "@/types/iam/role"

// Default filter values
const defaultFilters: ListRolesParams = {
    page: 1,
    pageSize: 10,
    search: "",
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    sortBy: "code",
    sortOrder: "asc",
}

function RolesPageContent() {
    // Filter state synced with URL
    const [filters, setFilters] = useUrlState<ListRolesParams>({
        defaultValues: defaultFilters,
    })

    // Dialog states
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isPermDialogOpen, setIsPermDialogOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)

    // Fetch data
    const { data, isLoading } = useRoles(filters)

    // Handlers
    const handleCreate = () => {
        setSelectedRole(null)
        setIsFormOpen(true)
    }

    const handleEdit = (role: Role) => {
        setSelectedRole(role)
        setIsFormOpen(true)
    }

    const handleDelete = (role: Role) => {
        setSelectedRole(role)
        setIsDeleteOpen(true)
    }

    const handleManagePermissions = (role: Role) => {
        setSelectedRole(role)
        setIsPermDialogOpen(true)
    }

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page })
    }

    const handlePageSizeChange = (pageSize: number) => {
        setFilters({ ...filters, pageSize, page: 1 })
    }

    return (
        <>
            <PageHeader title="Roles & Permissions" subtitle="Manage roles and their associated permissions for access control." />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Roles</CardTitle>
                        <CardDescription>
                            Total: {data?.pagination?.totalItems ?? 0} roles
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Role
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <RoleFilters filters={filters} onFiltersChange={setFilters} />

                    {/* Table */}
                    <RoleTable
                        data={data?.data ?? []}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onManagePermissions={handleManagePermissions}
                    />

                    {/* Pagination */}
                    <RolePagination
                        pagination={data?.pagination}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </CardContent>
            </Card>

            {/* Dialogs */}
            <RoleFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                role={selectedRole}
            />
            <RoleDeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                role={selectedRole}
            />
            <RolePermissionsDialog
                open={isPermDialogOpen}
                onOpenChange={setIsPermDialogOpen}
                role={selectedRole}
            />
        </>
    )
}

export default function RolesPageClient() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <RolesPageContent />
        </Suspense>
    )
}
