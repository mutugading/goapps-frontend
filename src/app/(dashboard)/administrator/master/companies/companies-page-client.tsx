"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

import {
    CompanyFormDialog,
    CompanyDeleteDialog,
    CompanyFilters,
    CompanyTable,
    CompanyPagination,
} from "@/components/iam/companies"

import { useCompanies } from "@/hooks/iam/use-company"
import { useUrlState } from "@/lib/hooks"
import { usePermissionContext } from "@/providers/permission-provider"
import { type Company, type ListCompaniesParams, ActiveFilter } from "@/types/iam/company"

const defaultFilters: ListCompaniesParams = {
    page: 1,
    pageSize: 10,
    search: "",
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    sortBy: "company_code",
    sortOrder: "asc",
}

function PageContent() {
    const { hasPermission } = usePermissionContext()
    const canCreate = hasPermission("iam.master.company.create")

    const [filters, setFilters] = useUrlState<ListCompaniesParams>({ defaultValues: defaultFilters })
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Company | null>(null)

    const { data, isLoading, isError, error } = useCompanies(filters)

    const totalItems = data?.pagination?.totalItems ?? 0

    return (
        <div>
            <PageHeader title="Companies" subtitle="Manage company entities">
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <Button onClick={() => { setSelected(null); setIsFormOpen(true) }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Company
                        </Button>
                    )}
                </div>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Company List</CardTitle>
                    <CardDescription>{isLoading ? "Loading…" : `${totalItems} total companies`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CompanyFilters filters={filters} onFiltersChange={setFilters} />
                    {isError && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                            {error instanceof Error ? error.message : "Failed to load companies"}
                        </div>
                    )}
                    <CompanyTable
                        data={data?.data || []}
                        isLoading={isLoading}
                        onEdit={(c) => { setSelected(c); setIsFormOpen(true) }}
                        onDelete={(c) => { setSelected(c); setIsDeleteOpen(true) }}
                    />
                    <CompanyPagination
                        pagination={data?.pagination}
                        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
                        onPageSizeChange={(pageSize) => setFilters((p) => ({ ...p, pageSize, page: 1 }))}
                    />
                </CardContent>
            </Card>
            <CompanyFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} company={selected} />
            <CompanyDeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} company={selected} />
        </div>
    )
}

function PageSkeleton() {
    return (
        <div>
            <PageHeader title="Companies" subtitle="Manage company entities">
                <Button disabled><Plus className="mr-2 h-4 w-4" /> Add Company</Button>
            </PageHeader>
            <Card>
                <CardHeader><CardTitle>Company List</CardTitle><CardDescription>Loading…</CardDescription></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function CompaniesPageClient() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <PageContent />
        </Suspense>
    )
}
