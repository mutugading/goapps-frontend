"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

import {
    CompanyMappingFormDialog,
    CompanyMappingDeleteDialog,
    CompanyMappingFilters,
    CompanyMappingTable,
    CompanyMappingPagination,
} from "@/components/iam/company-mappings"

import { useCompanyMappings } from "@/hooks/iam/use-company-mapping"
import { useUrlState } from "@/lib/hooks"
import { usePermissionContext } from "@/providers/permission-provider"
import { type CompanyMapping, type ListCompanyMappingsParams, ActiveFilter } from "@/types/iam/company-mapping"

const defaultFilters: ListCompanyMappingsParams = {
    page: 1,
    pageSize: 10,
    search: "",
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    sortBy: "code",
    sortOrder: "asc",
}

function PageContent() {
    const { hasPermission } = usePermissionContext()
    const canCreate = hasPermission("iam.master.companymapping.create")

    const [filters, setFilters] = useUrlState<ListCompanyMappingsParams>({ defaultValues: defaultFilters })
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<CompanyMapping | null>(null)

    const { data, isLoading, isError, error } = useCompanyMappings(filters)
    const totalItems = data?.pagination?.totalItems ?? 0

    return (
        <div>
            <PageHeader title="Company Mappings" subtitle="Manage organizational mappings combining company, division, department, and section">
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <Button onClick={() => { setSelected(null); setIsFormOpen(true) }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Mapping
                        </Button>
                    )}
                </div>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Company Mapping List</CardTitle>
                    <CardDescription>{isLoading ? "Loading…" : `${totalItems} total mappings`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CompanyMappingFilters filters={filters} onFiltersChange={setFilters} />
                    {isError && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                            {error instanceof Error ? error.message : "Failed to load mappings"}
                        </div>
                    )}
                    <CompanyMappingTable
                        data={data?.data || []}
                        isLoading={isLoading}
                        onEdit={(m) => { setSelected(m); setIsFormOpen(true) }}
                        onDelete={(m) => { setSelected(m); setIsDeleteOpen(true) }}
                    />
                    <CompanyMappingPagination
                        pagination={data?.pagination}
                        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
                        onPageSizeChange={(pageSize) => setFilters((p) => ({ ...p, pageSize, page: 1 }))}
                    />
                </CardContent>
            </Card>
            <CompanyMappingFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} mapping={selected} />
            <CompanyMappingDeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} mapping={selected} />
        </div>
    )
}

function PageSkeleton() {
    return (
        <div>
            <PageHeader title="Company Mappings" subtitle="Manage organizational mappings">
                <Button disabled><Plus className="mr-2 h-4 w-4" /> Add Mapping</Button>
            </PageHeader>
            <Card>
                <CardHeader><CardTitle>Company Mapping List</CardTitle><CardDescription>Loading…</CardDescription></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CompanyMappingsPageClient() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <PageContent />
        </Suspense>
    )
}
