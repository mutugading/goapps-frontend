"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Calculator, CheckCircle2, Layers, ListChecks } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { DebouncedSearchInput } from "@/components/common/debounced-search-input"
import { EmptyState } from "@/components/common/empty-state"
import { KpiCard, KpiGrid } from "@/components/common"
import { StatusBadge } from "@/components/common/status-badge"
import { UserName } from "@/components/common/user-name"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTablePagination } from "@/components/shared"
import { useCostResultsList } from "@/hooks/finance/use-cost-calc"
import { useUrlState } from "@/lib/hooks"

interface FiltersState {
  period: string
  calcType: string
  status: string
  search: string
  page: number
  pageSize: number
}

// Default view: latest period, ACTUAL, active rows — NO forced filters. Users
// narrow from here. The backend resolves the latest period when none is given.
const defaultFilters: FiltersState = {
  period: "",
  calcType: "ACTUAL",
  status: "",
  search: "",
  page: 1,
  pageSize: 50,
}

const CALC_TYPES = ["ACTUAL", "FORECAST", "SELLING"] as const
const STATUSES = ["CALCULATED", "VERIFIED", "APPROVED", "SUPERSEDED"] as const

function fmtMoney(v: string): string {
  const n = Number(v)
  if (!Number.isFinite(n)) return v
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function CostResultsPageClient() {
  const [filters, setFilters] = useUrlState<FiltersState>({ defaultValues: defaultFilters })

  const { data, isLoading } = useCostResultsList({
    period: filters.period || undefined,
    calculationType: filters.calcType || undefined,
    status: filters.status || undefined,
    search: filters.search || undefined,
    page: filters.page,
    pageSize: filters.pageSize,
  })

  const items = useMemo(() => data?.items ?? [], [data])
  const pagination = data?.pagination
  const totalItems = Number(pagination?.totalItems ?? 0)
  const resolvedPeriod = data?.resolvedPeriod || filters.period || "—"

  const kpis = useMemo(() => {
    const verified = items.filter((r) => r.status === "VERIFIED" || r.status === "APPROVED").length
    const avg =
      items.length > 0
        ? items.reduce((s, r) => s + (Number(r.costPerUnit) || 0), 0) / items.length
        : 0
    return { total: totalItems, onPage: items.length, verified, avg }
  }, [items, totalItems])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cost results"
        subtitle={`Per-product unit costs · period ${resolvedPeriod}`}
      />

      <KpiGrid>
        <KpiCard title="Results (period)" value={kpis.total.toLocaleString()} icon={ListChecks} />
        <KpiCard title="Shown on page" value={kpis.onPage} icon={Layers} />
        <KpiCard title="Verified / approved" value={kpis.verified} icon={CheckCircle2} variant="success" />
        <KpiCard
          title="Avg cost / unit"
          value={kpis.avg.toLocaleString("en-US", { maximumFractionDigits: 2 })}
          icon={Calculator}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <DebouncedSearchInput
          value={filters.search}
          onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
          placeholder="Search product code or name…"
        />
        <Input6Period value={filters.period} onChange={(period) => setFilters({ ...filters, period, page: 1 })} />
        <Select
          value={filters.calcType || "ALL"}
          onValueChange={(v) => setFilters({ ...filters, calcType: v === "ALL" ? "" : v, page: 1 })}
        >
          <SelectTrigger><SelectValue placeholder="Calc type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {CALC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select
          value={filters.status || "ALL"}
          onValueChange={(v) => setFilters({ ...filters, status: v === "ALL" ? "" : v, page: 1 })}
        >
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Active (default)</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No cost results"
          description="No calculated cost rows for this period/filter. Trigger a calculation from a product or calc job."
          action={<Button asChild variant="outline"><Link href="/finance/calc-jobs">Go to calc jobs</Link></Button>}
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="text-right">Cost / unit</TableHead>
                <TableHead className="hidden lg:table-cell text-right">RM</TableHead>
                <TableHead className="hidden lg:table-cell text-right">Conversion</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden xl:table-cell">By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.costId}>
                  <TableCell>
                    <Link
                      href={`/finance/cost-results/${r.productSysId}/${r.period}/${r.calculationType}`}
                      className="font-mono text-sm font-medium text-primary hover:underline"
                    >
                      {r.productCode || `#${r.productSysId}`}
                    </Link>
                    {r.productName && (
                      <div className="text-xs text-muted-foreground">{r.productName}</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">{r.calculationType}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmtMoney(r.costPerUnit)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-right font-mono text-sm">{fmtMoney(r.totalRmCost)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-right font-mono text-sm">{fmtMoney(r.totalConversion)}</TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">{fmtMoney(r.totalCost)}</TableCell>
                  <TableCell><StatusBadge status={r.status} type="cost" size="sm" /></TableCell>
                  <TableCell className="hidden xl:table-cell text-sm">
                    {r.calculatedBy ? <UserName userId={r.calculatedBy} /> : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
    </div>
  )
}

// Input6Period is a tiny YYYYMM text input that only commits 6-digit values.
function Input6Period({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={6}
      placeholder="Period YYYYMM (latest)"
      defaultValue={value}
      onBlur={(e) => {
        const v = e.target.value.trim()
        if (v === "" || /^[0-9]{6}$/.test(v)) onChange(v)
      }}
      className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    />
  )
}
