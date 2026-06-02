"use client"

// ComponentDetailTable — 6-column table for EBITDA component breakdown.
// Columns: Component | Current | MoM | MoM % | YoY | YoY %

import { useEffect, useState } from "react"
import { formatNumber } from "@/lib/bi/number-format"
import { cn } from "@/lib/utils"

interface ComponentDetailRow {
  category: string
  current: number
  mom: number
  momDiff: number
  momPct: number
  yoy: number
  yoyDiff: number
  yoyPct: number
}

interface ComponentDetailTableProps {
  dashboardCode: string
  /** YYYYMM period string (e.g. "202604"). */
  period?: string
  /** filter_group_1 value (e.g. "EBITDA") — passed as query param for server-side filtering. */
  group1?: string
  numberFormat?: string
  decimals?: number
  /** When provided, rows become clickable and this callback is called with the row's category. */
  onRowClick?: (category: string) => void
  /**
   * Current drill path from the main chart. When drillPath has items, the component-detail
   * table fetches group_3 data within the drilled group_2. The last element is passed as
   * the `drill` query param to the BFF.
   */
  drillPath?: string[]
}

function fmtPct(v: number): string {
  return (v >= 0 ? "▲" : "▼") + " " + Math.abs(v).toFixed(1) + "%"
}

export function ComponentDetailTable({
  dashboardCode,
  period,
  group1,
  numberFormat = "currency_thousands",
  decimals = 1,
  onRowClick,
  drillPath,
}: ComponentDetailTableProps) {
  // null = still loading; [] = loaded but empty; non-empty = data ready.
  const [rows, setRows] = useState<ComponentDetailRow[] | null>(null)

  // Last element in drillPath is the drilled group_2 segment (e.g. "INCOME").
  // Passing it to the BFF causes the backend to return group_3 data within that bucket.
  const drillSegment = drillPath && drillPath.length > 0 ? drillPath[drillPath.length - 1] : ""

  useEffect(() => {
    if (!period) {
      // No month selected — show empty state instead of perpetual loading.
      setRows([])
      return
    }
    const qs = new URLSearchParams({ period })
    if (group1) qs.set("group1", group1)
    if (drillSegment) qs.set("drill", drillSegment)
    let cancelled = false
    fetch(
      `/api/v1/finance/bi/dashboards/by-code/${dashboardCode}/component-detail?${qs.toString()}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((d: { rows?: ComponentDetailRow[] }) => {
        if (!cancelled) setRows(d.rows ?? [])
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })
    return () => {
      cancelled = true
    }
  }, [dashboardCode, period, group1, drillSegment])

  if (rows === null) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">Loading…</div>
    )
  }
  if (rows.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        No data for selected period
      </div>
    )
  }

  const fmt = numberFormat as Parameters<typeof formatNumber>[1]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2 pr-3 text-left font-semibold">Component</th>
            <th className="px-2 py-2 text-right font-semibold">Current</th>
            <th className="px-2 py-2 text-right font-semibold">MoM</th>
            <th className="px-2 py-2 text-right font-semibold">MoM %</th>
            <th className="px-2 py-2 text-right font-semibold">YoY</th>
            <th className="py-2 pl-2 text-right font-semibold">YoY %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.category}
              className={cn(
                "border-b border-border/50",
                onRowClick ? "cursor-pointer hover:bg-muted/50" : "hover:bg-muted/20 cursor-default",
              )}
              onClick={onRowClick ? () => onRowClick(r.category) : undefined}
            >
              <td className="py-1.5 pr-3 font-medium">{r.category}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {formatNumber(r.current, fmt, decimals)}
              </td>
              <td
                className={cn(
                  "px-2 py-1.5 text-right tabular-nums",
                  r.momDiff >= 0 ? "text-emerald-600" : "text-red-500",
                )}
              >
                {formatNumber(r.momDiff, fmt, decimals)}
              </td>
              <td
                className={cn(
                  "px-2 py-1.5 text-right tabular-nums",
                  r.momPct >= 0 ? "text-emerald-600" : "text-red-500",
                )}
              >
                {fmtPct(r.momPct)}
              </td>
              <td
                className={cn(
                  "px-2 py-1.5 text-right tabular-nums",
                  r.yoyDiff >= 0 ? "text-emerald-600" : "text-red-500",
                )}
              >
                {formatNumber(r.yoyDiff, fmt, decimals)}
              </td>
              <td
                className={cn(
                  "py-1.5 pl-2 text-right tabular-nums",
                  r.yoyPct >= 0 ? "text-emerald-600" : "text-red-500",
                )}
              >
                {fmtPct(r.yoyPct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
