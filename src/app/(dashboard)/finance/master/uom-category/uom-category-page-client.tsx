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
  UOMCategoryFormDialog,
  UOMCategoryDeleteDialog,
  UOMCategoryImportDialog,
  UOMCategoryFilters,
  UOMCategoryTable,
  UOMCategoryPagination,
} from "@/components/finance/uom-category"

import { useUOMCategories, useExportUOMCategories } from "@/hooks/finance/use-uom-category"
import { useUrlState } from "@/lib/hooks"
import {
  type UOMCategory,
  type ListUOMCategoriesParams,
  ActiveFilter,
} from "@/types/finance/uom-category"

const defaultFilters: ListUOMCategoriesParams = {
  page: 1,
  pageSize: 10,
  search: "",
  activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
  sortBy: "code",
  sortOrder: "asc",
}

function UOMCategoryPageContent() {
  const [filters, setFilters] = useUrlState<ListUOMCategoriesParams>({
    defaultValues: defaultFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedUOMCategory, setSelectedUOMCategory] = useState<UOMCategory | null>(null)

  const { data, isLoading, isError, error } = useUOMCategories(filters)
  const exportMutation = useExportUOMCategories()

  const handleAddNew = () => {
    setSelectedUOMCategory(null)
    setIsFormOpen(true)
  }

  const handleEdit = (uomCategory: UOMCategory) => {
    setSelectedUOMCategory(uomCategory)
    setIsFormOpen(true)
  }

  const handleDelete = (uomCategory: UOMCategory) => {
    setSelectedUOMCategory(uomCategory)
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
        title="UOM Categories"
        subtitle="Manage unit of measure categories"
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
            Add UOM Category
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>UOM Category List</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `${totalItems} total UOM categories`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UOMCategoryFilters filters={filters} onFiltersChange={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load UOM categories"}
            </div>
          )}

          <UOMCategoryTable
            data={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <UOMCategoryPagination
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <UOMCategoryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        uomCategory={selectedUOMCategory}
      />

      <UOMCategoryDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        uomCategory={selectedUOMCategory}
      />

      <UOMCategoryImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </div>
  )
}

function UOMCategoryPageSkeleton() {
  return (
    <div>
      <PageHeader
        title="UOM Categories"
        subtitle="Manage unit of measure categories"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export/Import
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add UOM Category
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>UOM Category List</CardTitle>
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

export default function UOMCategoryPageClient() {
  return (
    <Suspense fallback={<UOMCategoryPageSkeleton />}>
      <UOMCategoryPageContent />
    </Suspense>
  )
}
