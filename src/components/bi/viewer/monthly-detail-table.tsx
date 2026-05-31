"use client"

// MonthlyDetailTable — 4-column table for Net Profit month-by-month detail.
// Columns: Month | Net Profit | YoY % | vs <CompareLabel>

import { useEffect, useState } from "react"
import { formatNumber } from "@/lib/bi/number-format"
import { cn } from "@/lib/utils"

interface MonthlyDetailRow {
  period: string
  value: number
  yoyValue: number | null
  yoyDiff: number | null
  yoyPct: number | null
  vsCompare: number | null
  vsComparePct: number | null
}

interface MonthlyDetailTableProps {
  dashboardCode: string
  /** Dashboard code to compare against (e.g. "EBITDA"). */
  compareCode?: string
  /** Column header label for the compare column (e.g. "EBITDA"). */
  compareLabel?: string
  /**
   * For multi-metric dashboards, filter the monthly detail to this metric_name.
   * When omitted the first series is used (default for single-metric dashboards).
   */
  metricName?: string
  periodPreset?: string
  numberFormat?: string
  decimals?: number
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function fmtPeriod(yyyymm: string): string {
  const m = parseInt(yyyymm.slice(4, 6), 10)
  return `${MONTH_LABELS[m - 1] ?? ""} ${yyyymm.slice(0, 4)}`
}

function fmtPct(v: number): string {
  return (v >= 0 ? "▲" : "▼") + " " + Math.abs(v).toFixed(1) + "%"
}

export function MonthlyDetailTable({
  dashboardCode,
  compareCode,
  compareLabel,
  metricName,
  periodPreset = "L12M",
  numberFormat = "currency_thousands",
  decimals = 1,
}: MonthlyDetailTableProps) {
  // null = still loading; [] = loaded but empty; non-empty = data ready.
  const [rows, setRows] = useState<MonthlyDetailRow[] | null>(null)

  useEffect(() => {
    const qs = new URLSearchParams({ period: periodPreset })
    if (compareCode) qs.set("compare_code", compareCode)
    if (metricName) qs.set("metric_name", metricName)
    let cancelled = false
    fetch(
      `/api/v1/finance/bi/dashboards/by-code/${dashboardCode}/monthly-detail?${qs.toString()}`,
      { credentials: "include" },
    )
      .then((r) => r.json())
      .then((d: { rows?: MonthlyDetailRow[] }) => {
        if (!cancelled) setRows(d.rows ?? [])
      })
      .catch(() => {
        if (!cancelled) setRows([])
      })
    return () => {
      cancelled = true
    }
  }, [dashboardCode, compareCode, metricName, periodPreset])

  if (rows === null) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">Loading…</div>
    )
  }
  if (rows.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">No data</div>
    )
  }

  const fmt = numberFormat as Parameters<typeof formatNumber>[1]
  // Render newest first.
  const displayRows = [...rows].reverse()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b text-muted-foreground">
            <th className="py-2 pr-3 text-left font-semibold">Month</th>
            <th className="px-2 py-2 text-right font-semibold">{metricName ?? "Value"}</th>
            <th className="px-2 py-2 text-right font-semibold">YoY %</th>
            {compareCode && (
              <th className="py-2 pl-2 text-right font-semibold">
                vs {compareLabel ?? compareCode}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((r) => (
            <tr
              key={r.period}
              className="border-b border-border/50 hover:bg-muted/20"
            >
              <td className="py-1.5 pr-3 font-medium">{fmtPeriod(r.period)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums">
                {formatNumber(r.value, fmt, decimals)}
              </td>
              <td
                className={cn(
                  "px-2 py-1.5 text-right tabular-nums",
                  (r.yoyPct ?? 0) >= 0 ? "text-emerald-600" : "text-red-500",
                )}
              >
                {r.yoyPct !== null ? fmtPct(r.yoyPct) : "—"}
              </td>
              {compareCode && (
                <td
                  className={cn(
                    "py-1.5 pl-2 text-right tabular-nums",
                    (r.vsComparePct ?? 0) >= 0 ? "text-emerald-600" : "text-red-500",
                  )}
                >
                  {r.vsComparePct !== null ? fmtPct(r.vsComparePct) : "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
