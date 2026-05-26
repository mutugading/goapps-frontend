"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

import {
    DepartmentFormDialog,
    DepartmentDeleteDialog,
    DepartmentFilters,
    DepartmentTable,
    DepartmentPagination,
} from "@/components/iam/departments"

import { useDepartmentList } from "@/hooks/iam/use-departments"
import { useUrlState } from "@/lib/hooks"
import { usePermissionContext } from "@/providers/permission-provider"
import { type Department, type ListDepartmentsParams, ActiveFilter } from "@/types/iam/department"

const defaultFilters: ListDepartmentsParams = {
    page: 1,
    pageSize: 10,
    search: "",
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    sortBy: "department_code",
    sortOrder: "asc",
}

function PageContent() {
    const { hasPermission } = usePermissionContext()
    const canCreate = hasPermission("iam.master.department.create")

    const [filters, setFilters] = useUrlState<ListDepartmentsParams>({ defaultValues: defaultFilters })
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Department | null>(null)

    const { data, isLoading, isError, error } = useDepartmentList(filters)
    const totalItems = data?.pagination?.totalItems ?? 0

    return (
        <div>
            <PageHeader title="Departments" subtitle="Manage departments per division">
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <Button onClick={() => { setSelected(null); setIsFormOpen(true) }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Department
                        </Button>
                    )}
                </div>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Department List</CardTitle>
                    <CardDescription>{isLoading ? "Loading…" : `${totalItems} total departments`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DepartmentFilters filters={filters} onFiltersChange={setFilters} />
                    {isError && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                            {error instanceof Error ? error.message : "Failed to load departments"}
                        </div>
                    )}
                    <DepartmentTable
                        data={data?.data || []}
                        isLoading={isLoading}
                        onEdit={(d) => { setSelected(d); setIsFormOpen(true) }}
                        onDelete={(d) => { setSelected(d); setIsDeleteOpen(true) }}
                    />
                    <DepartmentPagination
                        pagination={data?.pagination}
                        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
                        onPageSizeChange={(pageSize) => setFilters((p) => ({ ...p, pageSize, page: 1 }))}
                    />
                </CardContent>
            </Card>
            <DepartmentFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} department={selected} />
            <DepartmentDeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} department={selected} />
        </div>
    )
}

function PageSkeleton() {
    return (
        <div>
            <PageHeader title="Departments" subtitle="Manage departments per division">
                <Button disabled><Plus className="mr-2 h-4 w-4" /> Add Department</Button>
            </PageHeader>
            <Card>
                <CardHeader><CardTitle>Department List</CardTitle><CardDescription>Loading…</CardDescription></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function DepartmentsPageClient() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <PageContent />
        </Suspense>
    )
}
