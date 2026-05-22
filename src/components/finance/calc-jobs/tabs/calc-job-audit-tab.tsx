"use client"

import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/shared"
import { UserName } from "@/components/common/user-name"
import { useAuditLogs } from "@/hooks/finance/use-cost-audit-log"
import { useUrlState } from "@/lib/hooks"
import type { ListCostAuditLogsParams } from "@/types/finance/cost-audit-log"

interface Props {
  jobId: number
}

// Backend writes calc-job audit rows under cal_job (consistent with the cost_*
// snake-cased entity_type values already in use). If the backend later renames,
// adjust here. Empty results just render an empty state — not a hard error.
const ENTITY_TYPE = "cal_job"

function fmtDate(ts: string | null | undefined): string {
  if (!ts) return "—"
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return ts
  }
}

export function CalcJobAuditTab({ jobId }: Props) {
  const [filters, setFilters] = useUrlState<ListCostAuditLogsParams>({
    defaultValues: {
      entityType: ENTITY_TYPE,
      entityId: jobId,
      page: 1,
      pageSize: 50,
    },
  })
  const { data, isLoading } = useAuditLogs({
    ...filters,
    entityType: ENTITY_TYPE,
    entityId: jobId,
  })
  const items = data?.items ?? []
  const totalItems = Number(data?.pagination?.totalItems ?? 0)
  const totalPages = Number(data?.pagination?.totalPages ?? 1)
  const currentPage = Number(data?.pagination?.currentPage ?? filters.page ?? 1)
  const pageSize = Number(data?.pagination?.pageSize ?? filters.pageSize ?? 50)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Audit trail for this calc job. Backend writes entries on lifecycle transitions
        (trigger, status change, cancel). Empty if no audit rows have been persisted yet.
      </p>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">When</TableHead>
              <TableHead className="w-40">Operation</TableHead>
              <TableHead className="w-40">User</TableHead>
              <TableHead>Before → after</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No audit entries for this job.
                </TableCell>
              </TableRow>
            )}
            {items.map((row) => (
              <TableRow key={row.logId} className="hover:bg-muted/50">
                <TableCell className="text-xs">{fmtDate(row.performedAt)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.operation}</Badge>
                </TableCell>
                <TableCell className="text-xs">
                  {row.userId ? <UserName userId={row.userId} compact /> : "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {row.beforeData || row.afterData ? (
                    <details>
                      <summary className="cursor-pointer text-primary">view diff</summary>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <div className="mb-1 text-[10px] uppercase text-muted-foreground">
                            before
                          </div>
                          <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                            {row.beforeData ?? "—"}
                          </pre>
                        </div>
                        <div>
                          <div className="mb-1 text-[10px] uppercase text-muted-foreground">
                            after
                          </div>
                          <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
                            {row.afterData ?? "—"}
                          </pre>
                        </div>
                      </div>
                    </details>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {totalItems > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={totalPages}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onPageSizeChange={(ps) => setFilters({ ...filters, pageSize: ps, page: 1 })}
        />
      )}
    </div>
  )
}
