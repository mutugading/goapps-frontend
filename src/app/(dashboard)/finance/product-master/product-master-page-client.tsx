"use client"

import { CheckCircle2, ChevronDown, FileSpreadsheet, Package, PauseCircle, Plus, Upload } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { PageHeader } from "@/components/common/page-header"
import { KpiCard, KpiGrid } from "@/components/common"
import { DebouncedSearchInput } from "@/components/common/debounced-search-input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DeactivateProductMasterDialog,
  ErpLinkageDialog,
  ProductMasterFormDialog,
  ProductMasterTable,
} from "@/components/finance/cost-product-master"
import { BulkImportDialog } from "@/components/finance/costing/bulk-import-dialog"
import { ImportDialog } from "@/components/finance/costing/import-dialog"
import { ProductTypeCombobox } from "@/components/finance/comboboxes"
import { DataTablePagination } from "@/components/shared"
import { useCostProductMasterCounts, useCostProductMasters, costProductMasterKeys } from "@/hooks/finance/use-cost-product-master"
import { useExportData } from "@/hooks/finance/use-cost-import"
import { useUrlState } from "@/lib/hooks"
import { exportBulkProductRouting } from "@/services/finance/cost-import-api"
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
  const router = useRouter()

  const [formOpen, setFormOpen] = useState(false)
  const [erpOpen, setErpOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [editing, setEditing] = useState<CostProductMaster | null>(null)
  const [bulkExportLoading, setBulkExportLoading] = useState(false)

  const { exportEntity, loading: exportLoading } = useExportData()

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

  function handleExport() {
    void exportEntity("product_master")
  }

  async function handleBulkExport() {
    setBulkExportLoading(true)
    try {
      const result = await exportBulkProductRouting()
      toast.success(`Export dijadwalkan — Job #${result.jobId}`, {
        description: "File akan tersedia di halaman Import Jobs setelah selesai diproses.",
        action: {
          label: "Lihat Jobs",
          onClick: () => router.push("/finance/import-jobs"),
        },
        duration: 8000,
      })
    } catch (e) {
      toast.error(`Export gagal: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setBulkExportLoading(false)
    }
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
        {/* Import dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 h-4 w-4" />
              Import
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setImportOpen(true)}>
              Import Produk
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setBulkImportOpen(true)}>
              Import Produk + Routing (Bulk)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={exportLoading || bulkExportLoading}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleExport}>
              Export Produk
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void handleBulkExport()}>
              Export Produk + Routing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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

      <ImportDialog
        entity="product_master"
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: costProductMasterKeys.all })
        }
      />
      <ProductMasterFormDialog open={formOpen} onOpenChange={setFormOpen} product={editing} />
      <ErpLinkageDialog open={erpOpen} onOpenChange={setErpOpen} product={editing} />
      <DeactivateProductMasterDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        product={editing}
      />
      <BulkImportDialog open={bulkImportOpen} onOpenChange={setBulkImportOpen} />
    </div>
  )
}
