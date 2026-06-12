"use client"

import { CheckCircle2, Package, PauseCircle, Plus } from "lucide-react"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { PageHeader } from "@/components/common/page-header"
import { KpiCard, KpiGrid } from "@/components/common"
import { DebouncedSearchInput } from "@/components/common/debounced-search-input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DeactivateProductMasterDialog,
  ErpLinkageDialog,
  ProductMasterFormDialog,
  ProductMasterTable,
} from "@/components/finance/cost-product-master"
import { ImportExportToolbar } from "@/components/finance/costing/import-export-toolbar"
import { ProductTypeCombobox } from "@/components/finance/comboboxes"
import { DataTablePagination } from "@/components/shared"
import { useCostProductMasterCounts, useCostProductMasters, costProductMasterKeys } from "@/hooks/finance/use-cost-product-master"
import { useUrlState } from "@/lib/hooks"
import type { CostProductMaster, ListCostProductMastersParams } from "@/types/finance/cost-product-master"

const defaultFilters: ListCostProductMastersParams = {
  search: "",
  productTypeId: 0,
  activeFilter: "active",
  page: 1,
  pageSize: 20,
}

export default function ProductMasterPageClient() {
  const [filters, setFilters] = useUrlState<ListCostProductMastersParams>({ defaultValues: defaultFilters })
  const { data, isLoading } = useCostProductMasters(filters)
  const { data: counts, isLoading: countsLoading } = useCostProductMasterCounts()
  const queryClient = useQueryClient()

  const [formOpen, setFormOpen] = useState(false)
  const [erpOpen, setErpOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [editing, setEditing] = useState<CostProductMaster | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(p: CostProductMaster) {
    setEditing(p)
    setFormOpen(true)
  }
  function openErp(p: CostProductMaster) {
    setEditing(p)
    setErpOpen(true)
  }
  function openDeactivate(p: CostProductMaster) {
    setEditing(p)
    setDeactivateOpen(true)
  }

  const items = data?.items ?? []
  const pagination = data?.pagination
  const totalItems = Number(pagination?.totalItems ?? 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Master"
        subtitle="Costing product identity (CPM_). Codes are auto-generated as CST + type + YYMM + 6-digit sequence."
      >
        <ImportExportToolbar
          entity="product_master"
          onImportSuccess={() =>
            queryClient.invalidateQueries({ queryKey: costProductMasterKeys.all })
          }
        />
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New product
        </Button>
      </PageHeader>

      <KpiGrid cols={3}>
        <KpiCard title="Total products" value={counts?.total ?? 0} icon={Package} loading={countsLoading} />
        <KpiCard title="Active" value={counts?.active ?? 0} icon={CheckCircle2} variant="success" loading={countsLoading} />
        <KpiCard title="Inactive" value={counts?.inactive ?? 0} icon={PauseCircle} loading={countsLoading} />
      </KpiGrid>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DebouncedSearchInput
          value={filters.search || ""}
          onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
          placeholder="Search by code, name, or ERP item…"
        />
        <ProductTypeCombobox
          value={filters.productTypeId || undefined}
          onChange={(typeId) => setFilters({ ...filters, productTypeId: typeId, page: 1 })}
          placeholder="All product types"
        />
        <Select
          value={filters.activeFilter || "active"}
          onValueChange={(v) => setFilters({ ...filters, activeFilter: v as "all" | "active" | "inactive", page: 1 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="inactive">Inactive only</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filters.productTypeId ? (
        <div className="text-xs text-muted-foreground">
          Filtering by product type.{" "}
          <button
            type="button"
            className="underline"
            onClick={() => setFilters({ ...filters, productTypeId: 0, page: 1 })}
          >
            Clear
          </button>
        </div>
      ) : null}

      <ProductMasterTable
        items={items}
        isLoading={isLoading}
        onEdit={openEdit}
        onLinkErp={openErp}
        onDeactivate={openDeactivate}
      />

      {totalItems > 0 && (
        <DataTablePagination
          currentPage={Number(pagination?.currentPage ?? 1)}
          pageSize={Number(pagination?.pageSize ?? 20)}
          totalItems={totalItems}
          totalPages={Number(pagination?.totalPages ?? 0)}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
        />
      )}

      <ProductMasterFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <ErpLinkageDialog open={erpOpen} onOpenChange={setErpOpen} product={editing} />
      <DeactivateProductMasterDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        product={editing}
      />
    </div>
  )
}
