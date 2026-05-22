"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { DebouncedSearchInput } from "@/components/common"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRoutes } from "@/hooks/finance/use-cost-route"
import type { RouteStatus } from "@/types/finance/cost-route"

export default function RoutesListPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<RouteStatus | "">("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading } = useRoutes({ search, status, page, pageSize })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Product Routes</h1>
          <p className="text-sm text-muted-foreground">
            Multi-stage routings (DAG): one head per product, each stage produces an intermediate or FG product.
          </p>
        </div>
      </div>

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
                  <StatusBadge status={h.routingStatus} />
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

function StatusBadge({ status }: { status: RouteStatus }) {
  const styles: Record<RouteStatus, string> = {
    DRAFT: "bg-slate-100 text-slate-700",
    COMPLETE: "bg-emerald-100 text-emerald-700",
    LOCKED: "bg-amber-100 text-amber-700",
  }
  return <Badge className={styles[status] || ""}>{status}</Badge>
}
