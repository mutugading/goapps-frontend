"use client"

import { useMemo } from "react"
import { ArrowRight, FileText, ListChecks } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/common/empty-state"
import { useColumnVisibility } from "@/components/shared/data-table/use-column-visibility"
import { cn } from "@/lib/utils"
import { typography } from "@/lib/ui/typography"
import { StatusBadge } from "./status-badge"
import type { CostProductRequest } from "@/types/finance/cost-product-request"
import type { ColumnDef } from "@/components/shared/data-table/types"

interface Props {
  items: CostProductRequest[]
  isLoading?: boolean
  onOpen: (r: CostProductRequest) => void
  onTrack?: (r: CostProductRequest) => void
  visibility: Record<string, boolean>
}

function humanize(value: string): string {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export const TABLE_ID = "product-requests-table"

export function buildColumns(hasTrack: boolean): ColumnDef<CostProductRequest>[] {
  return [
    { id: "request_no", header: "Request #", canHide: false },
    { id: "type",       header: "Type",      defaultHidden: true },
    { id: "title",      header: "Title",     canHide: false },
    { id: "customer",   header: "Customer",  defaultHidden: true },
    { id: "class",      header: "Class",     defaultHidden: true },
    { id: "urgency",    header: "Urgency",   defaultHidden: true },
    { id: "status",     header: "Status",    canHide: false },
    ...(hasTrack ? [{ id: "fills", header: "Fills", defaultHidden: true } as ColumnDef<CostProductRequest>] : []),
  ]
}

export function useRequestTableColumns(hasTrack: boolean) {
  const columns = useMemo(() => buildColumns(hasTrack), [hasTrack])
  const { visibility, toggle, setAll, reset } = useColumnVisibility(TABLE_ID, columns)
  return { columns, visibility, toggle, setAll, reset }
}

const th = cn(typography.tableHeader)

export function RequestTable({ items, isLoading, onOpen, onTrack, visibility }: Props) {
  const hasTrack = !!onTrack
  const columns = useMemo(() => buildColumns(hasTrack), [hasTrack])
  const show = (id: string) => visibility[id] !== false
  const visibleCount = columns.filter((c) => show(c.id)).length + 1 // +1 for action col

  return (
    /*
     * Scroll strategy: the shadcn <Table> component adds overflow-x-auto which creates
     * a scroll container and breaks position:sticky vertical. We use a raw <table>
     * inside overflow-x-auto + max-h-[540px] overflow-y-auto so:
     *   - Horizontal scroll works on narrow screens
     *   - sticky top-0 pins the thead while the tbody scrolls vertically inside this box
     * The layout's overflow-x-hidden prevents this from expanding the page horizontally.
     */
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[540px]">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_0_0_hsl(var(--border))]">
            <TableRow>
              {show("request_no") && <TableHead className={cn(th, "w-40 pl-4")}>Request #</TableHead>}
              {show("type")       && <TableHead className={cn(th, "w-28")}>Type</TableHead>}
              {show("title")      && <TableHead className={th}>Title</TableHead>}
              {show("customer")   && <TableHead className={cn(th, "w-44")}>Customer</TableHead>}
              {show("class")      && <TableHead className={cn(th, "w-28")}>Class</TableHead>}
              {show("urgency")    && <TableHead className={cn(th, "w-24")}>Urgency</TableHead>}
              {show("status")     && <TableHead className={cn(th, "w-44")}>Status</TableHead>}
              {show("fills") && onTrack && <TableHead className={cn(th, "w-16 text-center")}>Fills</TableHead>}
              <TableHead className={cn(th, "w-14 pr-4")} />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {show("request_no") && <TableCell className="pl-4"><Skeleton className="h-4 w-28" /></TableCell>}
                {show("type")       && <TableCell><Skeleton className="h-4 w-12" /></TableCell>}
                {show("title")      && <TableCell><Skeleton className="h-4 w-48" /></TableCell>}
                {show("customer")   && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                {show("class")      && <TableCell><Skeleton className="h-4 w-16" /></TableCell>}
                {show("urgency")    && <TableCell><Skeleton className="h-4 w-14" /></TableCell>}
                {show("status")     && <TableCell><Skeleton className="h-5 w-28 rounded-full" /></TableCell>}
                {show("fills") && onTrack && <TableCell />}
                <TableCell className="pr-4" />
              </TableRow>
            ))}

            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleCount} className="p-0">
                  <EmptyState
                    icon={FileText}
                    title="No requests found"
                    description="Try adjusting your search or status filter."
                    className="border-0 rounded-none"
                  />
                </TableCell>
              </TableRow>
            )}

            {items.map((r) => (
              <TableRow
                key={r.requestId}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => onOpen(r)}
              >
                {show("request_no") && (
                  <TableCell className="pl-4 font-mono text-xs">{r.requestNo}</TableCell>
                )}
                {show("type") && (
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {r.requestTypeCode ?? `#${r.requestTypeId}`}
                  </TableCell>
                )}
                {show("title") && (
                  <TableCell>
                    <div className="text-sm font-medium">{r.title}</div>
                    {r.description && (
                      <div className="text-xs text-muted-foreground truncate max-w-[40ch]">
                        {r.description}
                      </div>
                    )}
                  </TableCell>
                )}
                {show("customer") && (
                  <TableCell className="text-sm">{r.customerName}</TableCell>
                )}
                {show("class") && (
                  <TableCell className="text-sm">
                    <span>{humanize(r.productClassification)}</span>
                    {r.verifiedClassification && r.verifiedClassification !== r.productClassification && (
                      <span className="ml-1 text-xs text-orange-600">→ {humanize(r.verifiedClassification)}</span>
                    )}
                  </TableCell>
                )}
                {show("urgency") && (
                  <TableCell className="text-sm">{humanize(r.urgencyLevel)}</TableCell>
                )}
                {show("status") && (
                  <TableCell>
                    <StatusBadge status={r.status} substatus={r.closedSubstatus} />
                  </TableCell>
                )}
                {show("fills") && onTrack && (
                  <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                    <Button size="icon" variant="ghost" aria-label="Track fill tasks" onClick={() => onTrack(r)}>
                      <ListChecks className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
                <TableCell className="pr-4 text-right">
                  <Button size="icon" variant="ghost" aria-label="Open request">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </table>
      </div>
    </div>
  )
}
