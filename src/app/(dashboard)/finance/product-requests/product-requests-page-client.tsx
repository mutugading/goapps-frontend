"use client"

import { useState } from "react"
import { ArrowLeft, Plus } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { DebouncedSearchInput } from "@/components/common/debounced-search-input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared"
import {
  RequestDetailPanel,
  RequestFormDialog,
  RequestTable,
} from "@/components/finance/cost-product-request"
import { useCostProductRequest, useCostProductRequests } from "@/hooks/finance/use-cost-product-request"
import { useUrlState } from "@/lib/hooks"
import type { CostProductRequest, ListCostProductRequestsParams, RequestStatus } from "@/types/finance/cost-product-request"

const STATUSES: RequestStatus[] = [
  "DRAFT", "SUBMITTED", "UNDER_REVIEW", "ROUTING_DEFINED",
  "PARAMETER_PENDING", "PARAMETER_COMPLETE", "COSTING_DONE",
  "QUOTED", "QUOTE_READY", "CLOSED", "REJECTED",
]

const defaultFilters: ListCostProductRequestsParams = {
  search: "",
  status: "",
  page: 1,
  pageSize: 20,
}

export default function ProductRequestsPageClient() {
  const [filters, setFilters] = useUrlState<ListCostProductRequestsParams>({ defaultValues: defaultFilters })
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CostProductRequest | null>(null)
  const [selectedId, setSelectedId] = useState<number | undefined>()

  const { data: list, isLoading } = useCostProductRequests(filters)
  const { data: selected } = useCostProductRequest(selectedId)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }
  function openEdit(r: CostProductRequest) {
    setEditing(r)
    setFormOpen(true)
  }

  const items = list?.items ?? []
  const pagination = list?.pagination
  const totalItems = Number(pagination?.totalItems ?? 0)

  if (selected) {
    return (
      <div className="space-y-6">
        <PageHeader title={selected.requestNo} subtitle={selected.title}>
          <Button variant="outline" onClick={() => setSelectedId(undefined)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
          </Button>
        </PageHeader>
        <RequestDetailPanel request={selected} onEdit={() => openEdit(selected)} />
        <RequestFormDialog open={formOpen} onOpenChange={setFormOpen} request={editing} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Product Requests" subtitle="Marketing → Engineering request lifecycle (Phase A).">
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New request
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DebouncedSearchInput
          value={filters.search || ""}
          onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
          placeholder="Search by request #, title, or customer…"
        />
        <Select
          value={filters.status || "ALL"}
          onValueChange={(v) =>
            setFilters({ ...filters, status: v === "ALL" ? "" : (v as RequestStatus), page: 1 })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <RequestTable
        items={items}
        isLoading={isLoading}
        onOpen={(r) => setSelectedId(r.requestId)}
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

      <RequestFormDialog open={formOpen} onOpenChange={setFormOpen} request={editing} />
    </div>
  )
}
