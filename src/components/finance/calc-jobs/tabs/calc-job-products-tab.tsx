"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Download, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { DataTablePagination } from "@/components/shared"
import { StatusBadge } from "@/components/common/status-badge"
import { useUrlState } from "@/lib/hooks"
import { useCalcJobProducts } from "@/hooks/finance/use-cost-calc"
import type {
  CalJobProduct,
  JobProductStatus,
  ListCalcJobProductsParams,
} from "@/types/finance/cost-calc"

interface Props {
  jobId: number
  totalProducts: number
}

const STATUSES: JobProductStatus[] = [
  "PENDING",
  "READY",
  "CALCULATING",
  "SUCCESS",
  "FAILED",
  "BLOCKED",
  "SKIPPED",
]

const defaultFilters: ListCalcJobProductsParams & { tab: string } = {
  status: "",
  page: 1,
  pageSize: 50,
  tab: "products",
}

function fmtDate(ts: string | null): string {
  if (!ts) return "—"
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ts
  }
}

function fmtDuration(ms: number): string {
  if (!ms || ms <= 0) return "—"
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${(ms / 1000).toFixed(1)}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s - m * 60}s`
}

function prettyJson(s: string): string {
  if (!s) return ""
  try {
    return JSON.stringify(JSON.parse(s), null, 2)
  } catch {
    return s
  }
}

export function CalcJobProductsTab({ jobId }: Props) {
  const [filters, setFilters] = useUrlState<ListCalcJobProductsParams>({
    defaultValues: defaultFilters,
  })
  const { data, isLoading } = useCalcJobProducts(jobId, filters)
  const items = data?.items ?? []
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [exporting, setExporting] = useState(false)

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function patch(p: Partial<ListCalcJobProductsParams>) {
    setFilters({ ...filters, ...p, page: 1 })
  }

  async function exportBlockedCsv() {
    setExporting(true)
    try {
      const qs = new URLSearchParams({ status: "BLOCKED", page: "1", pageSize: "10000" })
      const res = await fetch(`/api/v1/finance/calc-jobs/${jobId}/products?${qs.toString()}`)
      const json = await res.json()
      const rows = ((json.data as Record<string, unknown>[]) || []).map((r) => ({
        product_code: String(r.productCode ?? r.product_code ?? ""),
        product_name: String(r.productName ?? r.product_name ?? ""),
        wave_no: String(r.waveNo ?? r.wave_no ?? ""),
        status: String(r.status ?? ""),
        block_reason: String(r.blockReason ?? r.block_reason ?? ""),
        error_message: String(r.errorMessage ?? r.error_message ?? ""),
      }))
      const header = ["product_code", "product_name", "wave_no", "status", "block_reason", "error_message"]
      const csv = [
        header.join(","),
        ...rows.map((r) =>
          header.map((h) => `"${String(r[h as keyof typeof r] ?? "").replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `calc-job-${jobId}-blocked.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
          <Select
            value={filters.status || "all"}
            onValueChange={(v) =>
              patch({ status: v === "all" ? "" : (v as JobProductStatus) })
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
        {filters.status === "BLOCKED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={exportBlockedCsv}
            disabled={exporting}
          >
            <Download className="mr-1 h-3 w-3" />
            {exporting ? "Exporting…" : "Export blocked CSV"}
          </Button>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-36">Product code</TableHead>
              <TableHead>Product name</TableHead>
              <TableHead className="w-16 text-right">Wave</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead>Block / error</TableHead>
              <TableHead className="w-24 text-right">Duration</TableHead>
              <TableHead className="w-36">Completed at</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            )}
            {items.map((p) => {
              const isOpen = expanded.has(p.jobProductId)
              return (
                <ProductRow
                  key={p.jobProductId}
                  p={p}
                  isOpen={isOpen}
                  onToggle={() => toggle(p.jobProductId)}
                />
              )
            })}
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

function ProductRow({
  p,
  isOpen,
  onToggle,
}: {
  p: CalJobProduct
  isOpen: boolean
  onToggle: () => void
}) {
  const hasLog = !!p.calculationLogJson
  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <button
            type="button"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground"
            disabled={!hasLog}
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {hasLog ? (
              isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <ChevronRight className="h-4 w-4 opacity-20" />
            )}
          </button>
        </TableCell>
        <TableCell className="font-mono text-xs">{p.productCode || "—"}</TableCell>
        <TableCell className="text-xs">{p.productName || "—"}</TableCell>
        <TableCell className="text-right font-mono text-xs">{p.waveNo}</TableCell>
        <TableCell>
          <StatusBadge status={p.status} type="chunk" size="sm" />
        </TableCell>
        <TableCell className="text-xs">
          {p.status === "BLOCKED" && p.blockReason ? (
            <span className="text-amber-700">{p.blockReason}</span>
          ) : p.errorMessage ? (
            <span className="text-red-700">{p.errorMessage}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className="text-right text-xs">{fmtDuration(p.durationMs)}</TableCell>
        <TableCell className="text-xs">{fmtDate(p.completedAt)}</TableCell>
      </TableRow>
      {isOpen && hasLog && (
        <TableRow>
          <TableCell colSpan={8} className="bg-muted/30">
            <pre className="overflow-x-auto rounded bg-background p-2 text-xs">
              {prettyJson(p.calculationLogJson)}
            </pre>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
