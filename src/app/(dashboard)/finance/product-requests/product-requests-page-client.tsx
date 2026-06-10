"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Ban, FileText, Inbox, Plus, XCircle } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { DebouncedSearchInput } from "@/components/common/debounced-search-input"
import { KpiCard, KpiGrid } from "@/components/common"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { DataTablePagination } from "@/components/shared"
import {
  RequestFormDialog,
  RequestTable,
} from "@/components/finance/cost-product-request"
import { FillTrackingDrawer } from "@/components/finance/fill-assignment"
import { useCostProductRequestCounts, useCostProductRequests } from "@/hooks/finance/use-cost-product-request"
import { useUrlState } from "@/lib/hooks"
import { usePermissionContext } from "@/providers/permission-provider"
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
  const router = useRouter()
  const { hasPermission } = usePermissionContext()
  const canCreate = hasPermission("finance.product.request.create")
  const [filters, setFilters] = useUrlState<ListCostProductRequestsParams>({ defaultValues: defaultFilters })
  const [formOpen, setFormOpen] = useState(false)
  const [trackingRequest, setTrackingRequest] = useState<CostProductRequest | null>(null)

  const { data: list, isLoading } = useCostProductRequests(filters)
  const { data: counts, isLoading: countsLoading } = useCostProductRequestCounts()

  function openCreate() {
    setFormOpen(true)
  }

  const items = list?.items ?? []
  const pagination = list?.pagination
  const totalItems = Number(pagination?.totalItems ?? 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Product Requests" subtitle="Marketing → Engineering request lifecycle (Phase A).">
        {canCreate && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> New request
          </Button>
        )}
      </PageHeader>

      <KpiGrid>
        <KpiCard title="Total requests" value={counts?.total ?? 0} icon={FileText} loading={countsLoading} />
        <KpiCard title="Open" value={counts?.open ?? 0} icon={Inbox} variant="warning" loading={countsLoading} />
        <KpiCard title="Rejected" value={counts?.rejected ?? 0} icon={XCircle} variant="destructive" loading={countsLoading} />
        <KpiCard title="Closed" value={counts?.closed ?? 0} icon={Ban} loading={countsLoading} />
      </KpiGrid>

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
        onOpen={(r) => router.push(`/finance/product-requests/${r.requestId}`)}
        onTrack={(r) => setTrackingRequest(r)}
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

      <RequestFormDialog open={formOpen} onOpenChange={setFormOpen} request={null} />

      <FillTrackingDrawer
        open={trackingRequest !== null}
        onOpenChange={(open) => { if (!open) setTrackingRequest(null); }}
        requestId={trackingRequest?.requestId ?? 0}
        requestNo={trackingRequest?.requestNo ?? ""}
      />
    </div>
  )
}
