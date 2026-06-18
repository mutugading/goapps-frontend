"use client"

import { useState } from "react"
import { ChevronRight, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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

import { fmtDate } from "./calc-job-tab-utils"

interface Props {
  jobId: number
}

// Backend writes calc-job audit rows under cal_job (consistent with the cost_*
// snake-cased entity_type values already in use).
const ENTITY_TYPE = "cal_job"

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
        Audit trail for this calc job. Entries are written on lifecycle transitions (trigger,
        status change, cancel).
      </p>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
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
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading audit log…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    No audit entries for this job.
                  </TableCell>
                </TableRow>
              )}
              {items.map((row) => (
                <TableRow key={row.logId} className="hover:bg-muted/50 align-top">
                  <TableCell className="text-sm">{fmtDate(row.performedAt)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-[11px] font-normal">
                      {row.operation}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.userId ? <UserName userId={row.userId} compact /> : "—"}
                  </TableCell>
                  <TableCell>
                    {row.beforeData || row.afterData ? (
                      <DiffCollapsible before={row.beforeData} after={row.afterData} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

function DiffCollapsible({
  before,
  after,
}: {
  before: string | null | undefined
  after: string | null | undefined
}) {
  const [open, setOpen] = useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 gap-1 px-2 text-xs text-primary">
          View diff
          <ChevronRight
            className="h-3 w-3 transition-transform duration-150 data-[state=open]:rotate-90"
            data-state={open ? "open" : "closed"}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Before</p>
            <pre className="overflow-x-auto rounded-md bg-muted p-2 text-xs">{before ?? "—"}</pre>
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">After</p>
            <pre className="overflow-x-auto rounded-md bg-muted p-2 text-xs">{after ?? "—"}</pre>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
