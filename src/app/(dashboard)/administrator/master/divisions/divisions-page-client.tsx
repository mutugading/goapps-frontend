"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

import {
    DivisionFormDialog,
    DivisionDeleteDialog,
    DivisionFilters,
    DivisionTable,
    DivisionPagination,
} from "@/components/iam/divisions"

import { useDivisions } from "@/hooks/iam/use-division"
import { useUrlState } from "@/lib/hooks"
import { usePermissionContext } from "@/providers/permission-provider"
import { type Division, type ListDivisionsParams, ActiveFilter } from "@/types/iam/division"

const defaultFilters: ListDivisionsParams = {
    page: 1,
    pageSize: 10,
    search: "",
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    sortBy: "division_code",
    sortOrder: "asc",
}

function PageContent() {
    const { hasPermission } = usePermissionContext()
    const canCreate = hasPermission("iam.master.division.create")

    const [filters, setFilters] = useUrlState<ListDivisionsParams>({ defaultValues: defaultFilters })
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Division | null>(null)

    const { data, isLoading, isError, error } = useDivisions(filters)
    const totalItems = data?.pagination?.totalItems ?? 0

    return (
        <div>
            <PageHeader title="Divisions" subtitle="Manage divisions per company">
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <Button onClick={() => { setSelected(null); setIsFormOpen(true) }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Division
                        </Button>
                    )}
                </div>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Division List</CardTitle>
                    <CardDescription>{isLoading ? "Loading…" : `${totalItems} total divisions`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DivisionFilters filters={filters} onFiltersChange={setFilters} />
                    {isError && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                            {error instanceof Error ? error.message : "Failed to load divisions"}
                        </div>
                    )}
                    <DivisionTable
                        data={data?.data || []}
                        isLoading={isLoading}
                        onEdit={(d) => { setSelected(d); setIsFormOpen(true) }}
                        onDelete={(d) => { setSelected(d); setIsDeleteOpen(true) }}
                    />
                    <DivisionPagination
                        pagination={data?.pagination}
                        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
                        onPageSizeChange={(pageSize) => setFilters((p) => ({ ...p, pageSize, page: 1 }))}
                    />
                </CardContent>
            </Card>
            <DivisionFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} division={selected} />
            <DivisionDeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} division={selected} />
        </div>
    )
}

function PageSkeleton() {
    return (
        <div>
            <PageHeader title="Divisions" subtitle="Manage divisions per company">
                <Button disabled><Plus className="mr-2 h-4 w-4" /> Add Division</Button>
            </PageHeader>
            <Card>
                <CardHeader><CardTitle>Division List</CardTitle><CardDescription>Loading…</CardDescription></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function DivisionsPageClient() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <PageContent />
        </Suspense>
    )
}
