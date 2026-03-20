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
    UserFormDialog,
    UserDeleteDialog,
    UserFilters,
    UserTable,
    UserPagination,
    UserRoleDialog,
} from "@/components/settings/users"

import { useUsers } from "@/hooks/iam/use-users"
import { useUrlState } from "@/lib/hooks"
import {
    type UserWithDetail,
    type ListUsersParams,
    ActiveFilter,
} from "@/types/iam/user"

// Default filter values
const defaultFilters: ListUsersParams = {
    page: 1,
    pageSize: 10,
    search: "",
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    sortBy: "username",
    sortOrder: "asc",
}

function UsersPageContent() {
    // Filter state synced with URL
    const [filters, setFilters] = useUrlState<ListUsersParams>({
        defaultValues: defaultFilters,
    })

    // Dialog states
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<UserWithDetail | null>(null)

    // Fetch data
    const { data, isLoading } = useUsers(filters)

    // Handlers
    const handleCreate = () => {
        setSelectedUser(null)
        setIsFormOpen(true)
    }

    const handleEdit = (user: UserWithDetail) => {
        setSelectedUser(user)
        setIsFormOpen(true)
    }

    const handleDelete = (user: UserWithDetail) => {
        setSelectedUser(user)
        setIsDeleteOpen(true)
    }

    const handleManageRoles = (user: UserWithDetail) => {
        setSelectedUser(user)
        setIsRoleDialogOpen(true)
    }

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page })
    }

    const handlePageSizeChange = (pageSize: number) => {
        setFilters({ ...filters, pageSize, page: 1 })
    }

    return (
        <>
            <PageHeader title="User Management" subtitle="Manage user accounts, credentials, and role assignments." />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>
                            Total: {data?.pagination?.totalItems ?? 0} users
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <UserFilters filters={filters} onFiltersChange={setFilters} />

                    {/* Table */}
                    <UserTable
                        data={data?.data ?? []}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onManageRoles={handleManageRoles}
                    />

                    {/* Pagination */}
                    <UserPagination
                        pagination={data?.pagination}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                </CardContent>
            </Card>

            {/* Dialogs */}
            <UserFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                user={selectedUser}
            />
            <UserDeleteDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                user={selectedUser}
            />
            <UserRoleDialog
                open={isRoleDialogOpen}
                onOpenChange={setIsRoleDialogOpen}
                user={selectedUser}
            />
        </>
    )
}

export default function UsersPageClient() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            }
        >
            <UsersPageContent />
        </Suspense>
    )
}
