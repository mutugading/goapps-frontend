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
  ErpItemTable,
  ErpItemFilters,
  ErpItemFormDialog,
  ErpItemDeleteDialog,
} from "@/components/finance/cost-erp-items"
import { DataTablePagination } from "@/components/shared"

import { useErpItems } from "@/hooks/finance/use-cost-erp"
import { useUrlState } from "@/lib/hooks"
import type { CostErpItem, ListErpItemsParams } from "@/types/finance/cost-erp"

const defaultFilters: ListErpItemsParams = {
  page: 1,
  pageSize: 10,
  search: "",
  itemType: "",
  activeFilter: "active",
}

function ErpItemsPageContent() {
  const [filters, setFilters] = useUrlState<ListErpItemsParams>({
    defaultValues: defaultFilters,
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CostErpItem | null>(null)

  const { data, isLoading, isError, error } = useErpItems(filters)

  const handleAddNew = () => {
    setSelectedItem(null)
    setIsFormOpen(true)
  }

  const handleEdit = (item: CostErpItem) => {
    setSelectedItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = (item: CostErpItem) => {
    setSelectedItem(item)
    setIsDeleteOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) setSelectedItem(null)
  }

  const handleDeleteClose = (open: boolean) => {
    setIsDeleteOpen(open)
    if (!open) setSelectedItem(null)
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }

  const totalItems = Number(data?.pagination?.totalItems ?? 0)

  return (
    <div>
      <PageHeader
        title="ERP Items"
        subtitle="Manage ERP item master data for the costing system"
      >
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add ERP Item
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">ERP Item List</CardTitle>
          <CardDescription>
            {isLoading ? "Loading..." : `${totalItems} total ERP items`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ErpItemFilters filters={filters} onFiltersChange={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error ? error.message : "Failed to load ERP items"}
            </div>
          )}

          <ErpItemTable
            data={data?.items || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          <DataTablePagination
            currentPage={filters.page ?? 1}
            pageSize={filters.pageSize ?? 10}
            totalItems={totalItems}
            totalPages={data?.pagination?.totalPages ?? 0}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <ErpItemFormDialog
        open={isFormOpen}
        onOpenChange={handleFormClose}
        item={selectedItem}
      />

      <ErpItemDeleteDialog
        open={isDeleteOpen}
        onOpenChange={handleDeleteClose}
        item={selectedItem}
      />
    </div>
  )
}

function ErpItemsPageSkeleton() {
  return (
    <div>
      <PageHeader title="ERP Items" subtitle="Manage ERP item master data for the costing system">
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add ERP Item
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">ERP Item List</CardTitle>
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

export default function ErpItemsPageClient() {
  return (
    <Suspense fallback={<ErpItemsPageSkeleton />}>
      <ErpItemsPageContent />
    </Suspense>
  )
}
