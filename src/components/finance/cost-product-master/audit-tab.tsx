"use client"

// AuditTab — read-only audit trail for a product master. Wires the generic
// cost-audit-log stream filtered to this entity. Empty until product-master
// CRUD writes audit rows (cost change history lives in the Cost history tab).
import { Loader2 } from "lucide-react"

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/common/empty-state"
import { UserName } from "@/components/common/user-name"
import { useAuditLogs } from "@/hooks/finance/use-cost-audit-log"

interface Props {
  productSysId: number
}

const PRODUCT_MASTER_ENTITY = "cost_product_master"

export function ProductAuditTab({ productSysId }: Props) {
  const { data, isLoading } = useAuditLogs({
    entityType: PRODUCT_MASTER_ENTITY,
    entityId: productSysId,
    pageSize: 50,
  })
  const items = data?.items ?? []

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading audit trail…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No audit entries"
        description="No recorded changes for this product yet. Cost recompute history is on the Cost history tab."
      />
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Operation</TableHead>
          <TableHead>By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((log) => (
          <TableRow key={log.logId}>
            <TableCell className="text-sm">
              {log.performedAt
                ? new Date(log.performedAt).toLocaleString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </TableCell>
            <TableCell className="text-sm capitalize">{log.operation || "—"}</TableCell>
            <TableCell className="text-sm">
              {log.userId ? <UserName userId={log.userId} /> : "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
