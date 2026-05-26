"use client"

import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, FileStack, Loader2, Lock, PencilRuler } from "lucide-react"

import { DebouncedSearchInput, KpiCard, KpiGrid, PageHeader } from "@/components/common"
import { StatusBadge } from "@/components/common/status-badge"
import { CreateRoutingWizard } from "@/components/finance/cost-product-request/create-routing-wizard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouteCounts, useRoutes } from "@/hooks/finance/use-cost-route"
import type { RouteStatus } from "@/types/finance/cost-route"

export default function RoutesListPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<RouteStatus | "">("")
  const [page, setPage] = useState(1)
  const [wizardOpen, setWizardOpen] = useState(false)
  const pageSize = 20

  const { data, isLoading } = useRoutes({ search, status, page, pageSize })
  const { data: counts, isLoading: countsLoading } = useRouteCounts()

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Product Routes"
        subtitle="Multi-stage routings (DAG): one head per product, each stage produces an intermediate or FG product."
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>+ New route ▾</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setWizardOpen(true)}>
              From product (wizard)
            </DropdownMenuItem>
            {/* "From template (duplicate)" deferred — user opens an existing route then Fork. */}
          </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <KpiGrid>
        <KpiCard title="Total routes" value={counts?.total ?? 0} icon={FileStack} loading={countsLoading} />
        <KpiCard title="Draft" value={counts?.draft ?? 0} icon={PencilRuler} variant="warning" loading={countsLoading} />
        <KpiCard title="Complete" value={counts?.complete ?? 0} icon={CheckCircle2} variant="success" loading={countsLoading} />
        <KpiCard title="Locked" value={counts?.locked ?? 0} icon={Lock} loading={countsLoading} />
      </KpiGrid>

      <CreateRoutingWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        requestId={0}
      />

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[260px] flex-1">
            <DebouncedSearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v)
                setPage(1)
              }}
              placeholder="Search by product code or name…"
              debounceMs={300}
            />
          </div>
          <Select
            value={status || "ALL"}
            onValueChange={(v) => {
              setStatus(v === "ALL" ? "" : (v as RouteStatus))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="COMPLETE">COMPLETE</SelectItem>
              <SelectItem value="LOCKED">LOCKED</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Head #</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>From draft</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && data?.items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No routes yet. Promote a routing draft to create one.
                </TableCell>
              </TableRow>
            )}
            {data?.items.map((h) => (
              <TableRow key={h.headId}>
                <TableCell className="font-mono">#{h.headId}</TableCell>
                <TableCell>
                  <div className="font-medium">{h.productCode || "—"}</div>
                  <div className="text-xs text-muted-foreground">{h.productName || ""}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={h.routingStatus} type="route" />
                </TableCell>
                <TableCell>v{h.version}</TableCell>
                <TableCell>{h.promotedFromDraftId ? `#${h.promotedFromDraftId}` : "—"}</TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/finance/routes/${h.headId}`}>Open</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {data.page} of {data.totalPages} ({data.total} total)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

