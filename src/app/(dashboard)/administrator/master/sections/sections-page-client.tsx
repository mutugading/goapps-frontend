"use client"

import { useState, Suspense } from "react"
import { Plus, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

import {
    SectionFormDialog,
    SectionDeleteDialog,
    SectionFilters,
    SectionTable,
    SectionPagination,
} from "@/components/iam/sections"

import { useSections } from "@/hooks/iam/use-section"
import { useUrlState } from "@/lib/hooks"
import { usePermissionContext } from "@/providers/permission-provider"
import { type Section, type ListSectionsParams, ActiveFilter } from "@/types/iam/section"

const defaultFilters: ListSectionsParams = {
    page: 1,
    pageSize: 10,
    search: "",
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    sortBy: "section_code",
    sortOrder: "asc",
}

function PageContent() {
    const { hasPermission } = usePermissionContext()
    const canCreate = hasPermission("iam.master.section.create")

    const [filters, setFilters] = useUrlState<ListSectionsParams>({ defaultValues: defaultFilters })
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selected, setSelected] = useState<Section | null>(null)

    const { data, isLoading, isError, error } = useSections(filters)
    const totalItems = data?.pagination?.totalItems ?? 0

    return (
        <div>
            <PageHeader title="Sections" subtitle="Manage sections per department">
                <div className="flex items-center gap-2">
                    {canCreate && (
                        <Button onClick={() => { setSelected(null); setIsFormOpen(true) }}>
                            <Plus className="mr-2 h-4 w-4" /> Add Section
                        </Button>
                    )}
                </div>
            </PageHeader>
            <Card>
                <CardHeader>
                    <CardTitle>Section List</CardTitle>
                    <CardDescription>{isLoading ? "Loading…" : `${totalItems} total sections`}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <SectionFilters filters={filters} onFiltersChange={setFilters} />
                    {isError && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
                            {error instanceof Error ? error.message : "Failed to load sections"}
                        </div>
                    )}
                    <SectionTable
                        data={data?.data || []}
                        isLoading={isLoading}
                        onEdit={(s) => { setSelected(s); setIsFormOpen(true) }}
                        onDelete={(s) => { setSelected(s); setIsDeleteOpen(true) }}
                    />
                    <SectionPagination
                        pagination={data?.pagination}
                        onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
                        onPageSizeChange={(pageSize) => setFilters((p) => ({ ...p, pageSize, page: 1 }))}
                    />
                </CardContent>
            </Card>
            <SectionFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} section={selected} />
            <SectionDeleteDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} section={selected} />
        </div>
    )
}

function PageSkeleton() {
    return (
        <div>
            <PageHeader title="Sections" subtitle="Manage sections per department">
                <Button disabled><Plus className="mr-2 h-4 w-4" /> Add Section</Button>
            </PageHeader>
            <Card>
                <CardHeader><CardTitle>Section List</CardTitle><CardDescription>Loading…</CardDescription></CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function SectionsPageClient() {
    return (
        <Suspense fallback={<PageSkeleton />}>
            <PageContent />
        </Suspense>
    )
}
