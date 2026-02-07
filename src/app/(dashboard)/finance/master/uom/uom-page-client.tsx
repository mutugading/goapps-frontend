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
  UOMFormDialog,
  UOMDeleteDialog,
  UOMImportDialog,
  UOMFilters,
  UOMTable,
  UOMPagination,
} from "@/components/finance/uom"

import { useUOMs, useExportUOMs } from "@/hooks/finance/use-uom"
import { useUrlState } from "@/lib/hooks"
import {
  type UOM,
  type ListUOMsParams,
  UOMCategory,
  ActiveFilter,
} from "@/types/finance/uom"

// Default filter values
const defaultFilters: ListUOMsParams = {
  page: 1,
  pageSize: 10,
  search: "",
  category: UOMCategory.UOM_CATEGORY_UNSPECIFIED,
  activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
  sortBy: "code",
  sortOrder: "asc",
}

function UOMPageContent() {
  // Filter state synced with URL
  const [filters, setFilters] = useUrlState<ListUOMsParams>({
    defaultValues: defaultFilters,
  })

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [selectedUOM, setSelectedUOM] = useState<UOM | null>(null)

  // Queries and mutations
  const { data, isLoading, isError, error } = useUOMs(filters)
  const exportMutation = useExportUOMs()

  // Handlers
  const handleAddNew = () => {
    setSelectedUOM(null)
    setIsFormOpen(true)
  }

  const handleEdit = (uom: UOM) => {
    setSelectedUOM(uom)
    setIsFormOpen(true)
  }

  const handleDelete = (uom: UOM) => {
    setSelectedUOM(uom)
    setIsDeleteOpen(true)
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      category: filters.category,
      activeFilter: filters.activeFilter,
    })
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }

  // Calculate total items for display
  const totalItems = data?.pagination?.totalItems ?? 0

  return (
    <div>
      <PageHeader
        title="Units of Measure"
        subtitle="Manage units of measure for costing calculations"
      >
        <div className="flex items-center gap-2">
          {/* Export/Import Dropdown */}
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

          {/* Add Button */}
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add UOM
          </Button>
        </div>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>UOM List</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `${totalItems} total units of measure`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <UOMFilters filters={filters} onFiltersChange={setFilters} />

          {/* Error State */}
          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load units of measure"}
            </div>
          )}

          {/* Table */}
          <UOMTable
            data={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* Pagination */}
          <UOMPagination
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <UOMFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        uom={selectedUOM}
      />

      {/* Delete Dialog */}
      <UOMDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        uom={selectedUOM}
      />

      {/* Import Dialog */}
      <UOMImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </div>
  )
}

// Loading fallback for Suspense
function UOMPageSkeleton() {
  return (
    <div>
      <PageHeader
        title="Units of Measure"
        subtitle="Manage units of measure for costing calculations"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export/Import
          </Button>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add UOM
          </Button>
        </div>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle>UOM List</CardTitle>
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

// Default export with Suspense boundary (required for useSearchParams)
export default function UomPageClient() {
  return (
    <Suspense fallback={<UOMPageSkeleton />}>
      <UOMPageContent />
    </Suspense>
  )
}
