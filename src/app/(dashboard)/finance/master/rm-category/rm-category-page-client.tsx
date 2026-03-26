"use client"

import { useState, Suspense } from "react"
import { Plus, Download, Upload, Loader2 } from "lucide-react"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  RMCategoryFormDialog,
  RMCategoryDeleteDialog,
  RMCategoryImportDialog,
  RMCategoryFilters,
  RMCategoryTable,
  RMCategoryPagination,
} from "@/components/finance/rm-category"

import { useRMCategories, useExportRMCategories } from "@/hooks/finance/use-rm-category"
import { useUrlState } from "@/lib/hooks"
import {
  type RMCategory,
  type ListRMCategoriesParams,
  ActiveFilter,
} from "@/types/finance/rm-category"

const defaultFilters: ListRMCategoriesParams = {
  page: 1,
  pageSize: 10,
  search: "",
  activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
  sortBy: "code",
  sortOrder: "asc",
}

function RMCategoryPageContent() {
  const [filters, setFilters] = useUrlState<ListRMCategoriesParams>({
    defaultValues: defaultFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedRMCategory, setSelectedRMCategory] = useState<RMCategory | null>(null)

  const { data, isLoading, isError, error } = useRMCategories(filters)
  const exportMutation = useExportRMCategories()

  const handleAddNew = () => {
    setSelectedRMCategory(null)
    setIsFormOpen(true)
  }

  const handleEdit = (rmCategory: RMCategory) => {
    setSelectedRMCategory(rmCategory)
    setIsFormOpen(true)
  }

  const handleDelete = (rmCategory: RMCategory) => {
    setSelectedRMCategory(rmCategory)
    setIsDeleteOpen(true)
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      activeFilter: filters.activeFilter,
    })
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }

  const totalItems = data?.pagination?.totalItems ?? 0

  return (
    <div>
      <PageHeader
        title="Raw Material Categories"
        subtitle="Manage raw material categories for costing calculations"
      >
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {exportMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export/Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleExport}
                disabled={exportMutation.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import from Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add RM Category
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>RM Category List</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `${totalItems} total raw material categories`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RMCategoryFilters filters={filters} onFiltersChange={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load raw material categories"}
            </div>
          )}

          <RMCategoryTable
            data={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <RMCategoryPagination
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <RMCategoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        rmCategory={selectedRMCategory}
      />

      <RMCategoryDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        rmCategory={selectedRMCategory}
      />

      <RMCategoryImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </div>
  )
}

function RMCategoryPageSkeleton() {
  return (
    <div>
      <PageHeader
        title="Raw Material Categories"
        subtitle="Manage raw material categories for costing calculations"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export/Import
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add RM Category
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>RM Category List</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function RMCategoryPageClient() {
  return (
    <Suspense fallback={<RMCategoryPageSkeleton />}>
      <RMCategoryPageContent />
    </Suspense>
  )
}
