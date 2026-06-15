"use client"

import { Loader2 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DataTablePagination } from "@/components/shared"
import { StatusBadge } from "@/components/common/status-badge"
import { useUrlState } from "@/lib/hooks"
import { useCalcJobChunks } from "@/hooks/finance/use-cost-calc"
import type {
  ChunkStatus,
  ListCalcJobChunksParams,
} from "@/types/finance/cost-calc"

interface Props {
  jobId: number
}

const STATUSES: ChunkStatus[] = [
  "QUEUED",
  "DISPATCHED",
  "PROCESSING",
  "SUCCESS",
  "PARTIAL_FAILED",
  "FAILED",
]

const defaultFilters: ListCalcJobChunksParams = {
  waveNo: undefined,
  status: "",
  page: 1,
  pageSize: 50,
}

function fmtDuration(ms: number): string {
  if (!ms || ms <= 0) return "—"
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${(ms / 1000).toFixed(1)}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s - m * 60}s`
}

function truncate(s: string, n = 60): string {
  if (!s) return ""
  return s.length > n ? `${s.slice(0, n)}…` : s
}

export function CalcJobChunksTab({ jobId }: Props) {
  const [filters, setFilters] = useUrlState<ListCalcJobChunksParams>({
    defaultValues: defaultFilters,
  })
  const { data, isLoading } = useCalcJobChunks(jobId, filters)
  const items = data?.items ?? []

  function patch(p: Partial<ListCalcJobChunksParams>) {
    setFilters({ ...filters, ...p, page: 1 })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Wave #</div>
          <Input
            type="number"
            min={1}
            value={filters.waveNo ?? ""}
            placeholder="All waves"
            className="w-32"
            onChange={(e) => {
              const v = e.target.value
              patch({ waveNo: v ? Number(v) : undefined })
            }}
          />
        </div>
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
          <Select
            value={filters.status || "all"}
            onValueChange={(v) =>
              patch({ status: v === "all" ? "" : (v as ChunkStatus) })
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  <StatusBadge status={s} type="chunk" size="sm" />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-right">Chunk #</TableHead>
              <TableHead className="w-16 text-right">Wave</TableHead>
              <TableHead className="w-24 text-right">Products</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-40">Worker</TableHead>
              <TableHead className="w-20 text-right">Success</TableHead>
              <TableHead className="w-20 text-right">Failed</TableHead>
              <TableHead className="w-24 text-right">Duration</TableHead>
              <TableHead className="w-16 text-right">Retries</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                  No chunks found.
                </TableCell>
              </TableRow>
            )}
            {items.map((c) => (
              <TableRow key={c.chunkId} className="hover:bg-muted/50">
                <TableCell className="text-right font-mono text-xs">
                  {c.chunkNumber}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">{c.waveNo}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {c.productCount}
                </TableCell>
                <TableCell>
                  <StatusBadge status={c.status} type="chunk" size="sm" />
                </TableCell>
                <TableCell className="font-mono text-xs">{c.workerId || "—"}</TableCell>
                <TableCell className="text-right font-mono text-xs text-emerald-700">
                  {c.successCount}
                </TableCell>
                <TableCell className="text-right font-mono text-xs text-red-700">
                  {c.failedCount}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {fmtDuration(c.durationMs)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {c.retryCount}/{c.maxRetries}
                </TableCell>
                <TableCell className="text-xs text-red-700">
                  {c.errorMessage ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">{truncate(c.errorMessage)}</span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-md">
                          <p className="whitespace-pre-wrap text-xs">{c.errorMessage}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {data && data.total > 0 && (
        <DataTablePagination
          currentPage={data.page}
          pageSize={data.pageSize}
          totalItems={data.total}
          totalPages={data.totalPages}
          onPageChange={(page) => setFilters({ ...filters, page })}
          onPageSizeChange={(pageSize) => setFilters({ ...filters, pageSize, page: 1 })}
        />
      )}
    </div>
  )
}
