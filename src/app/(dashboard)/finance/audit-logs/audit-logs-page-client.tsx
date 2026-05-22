"use client"

import { useState } from "react"

import { PageHeader } from "@/components/common/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "@/components/shared"
import { UserName } from "@/components/common/user-name"
import { useAuditLogs } from "@/hooks/finance/use-cost-audit-log"
import { useUrlState } from "@/lib/hooks"
import type { CostAuditLog, ListCostAuditLogsParams } from "@/types/finance/cost-audit-log"

const defaultFilters: ListCostAuditLogsParams = {
  entityType: "",
  userId: "",
  operation: "",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: 50,
}

const OPERATIONS = [
  "INSERT", "UPDATE", "DELETE",
  "STATUS_CHANGE", "FEASIBILITY", "CLASSIFICATION_OVERRIDE",
  "ASSIGN", "PROMOTE", "HIDE", "UNHIDE",
  "RULE_CREATE", "RULE_UPDATE", "RULE_DELETE",
]

const ENTITY_TYPES = [
  "cost_product_request",
  "cost_routing_draft",
  "cost_routing_rule",
  "cost_request_comment",
  "cost_product_master",
  "cost_route_head",
]

export default function AuditLogsPageClient() {
  const [filters, setFilters] = useUrlState<ListCostAuditLogsParams>({ defaultValues: defaultFilters })
  const { data, isLoading } = useAuditLogs(filters)
  const items = data?.items ?? []
  const pagination = data?.pagination
  const totalItems = Number(pagination?.totalItems ?? 0)
  const [detail, setDetail] = useState<CostAuditLog | null>(null)

  function patch(p: Partial<ListCostAuditLogsParams>) {
    setFilters({ ...filters, ...p, page: 1 })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Append-only audit trail (CAL_). Snapshots before/after state for every sensitive operation."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Entity type</Label>
          <Select
            value={filters.entityType || "all"}
            onValueChange={(v) => patch({ entityType: v === "all" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {ENTITY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Operation</Label>
          <Select
            value={filters.operation || "all"}
            onValueChange={(v) => patch({ operation: v === "all" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {OPERATIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">User</Label>
          <Input
            value={filters.userId || ""}
            placeholder="user_id"
            onChange={(e) => patch({ userId: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">From</Label>
          <Input
            type="date"
            value={filters.fromDate || ""}
            onChange={(e) => patch({ fromDate: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">To</Label>
          <Input
            type="date"
            value={filters.toDate || ""}
            onChange={(e) => patch({ toDate: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">When</TableHead>
              <TableHead className="w-44">Entity</TableHead>
              <TableHead className="w-40">Operation</TableHead>
              <TableHead className="w-40">User</TableHead>
              <TableHead className="w-20 text-right">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No audit log entries match these filters.
                </TableCell>
              </TableRow>
            )}
            {items.map((row) => (
              <TableRow key={row.logId}>
                <TableCell className="font-mono text-xs">
                  {row.performedAt.slice(0, 19).replace("T", " ")}
                </TableCell>
                <TableCell>
                  <div className="font-mono text-xs">{row.entityType}</div>
                  <div className="text-xs text-muted-foreground">#{row.entityId}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{row.operation}</Badge>
                </TableCell>
                <TableCell className="text-xs"><UserName userId={row.userId} compact /></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => setDetail(row)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && (
        <DataTablePagination
          currentPage={Number(pagination?.currentPage ?? 1)}
          pageSize={Number(pagination?.pageSize ?? 50)}
          totalItems={totalItems}
          totalPages={Number(pagination?.totalPages ?? 0)}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
        />
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Audit entry #{detail?.logId} — {detail?.operation}
            </DialogTitle>
            <DialogDescription>
              {detail?.entityType} #{detail?.entityId} · by <UserName userId={detail?.userId || ""} compact /> at{" "}
              {detail?.performedAt?.slice(0, 19).replace("T", " ")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Before</div>
              <pre className="rounded border bg-muted p-2 text-xs whitespace-pre-wrap break-all max-h-[40vh] overflow-y-auto">
                {detail?.beforeData || "(no snapshot)"}
              </pre>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">After</div>
              <pre className="rounded border bg-muted p-2 text-xs whitespace-pre-wrap break-all max-h-[40vh] overflow-y-auto">
                {detail?.afterData || "(no snapshot)"}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
