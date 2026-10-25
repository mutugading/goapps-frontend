"use client"

// Employee Overtime table (table_mode=employee_ot, HD-18): one row per NIK with R1 period hours and
// the R2 week columns, grouped by the viewer's "Kelompokkan per" with a subtotal row per group.
// Drill NIK → day shows actual OT and limit hours per day.

import { Fragment, useState } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import type { ChartProps } from "@/components/bi/chart-engine/types"
import { toRechartsRows, cfgStr, cfgNum, type RechartsRow } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import {
  readEmployeeOTBlock,
  fmtDay,
  fmtRange,
  fmtDelta,
  localSubtotals,
  localSummary,
  GROUP_BY_LABELS,
  type EmployeeOTSubtotal,
} from "@/lib/bi/employee-ot"
import { EmployeeOTKpiRow } from "@/components/bi/chart-engine/employee-ot-kpi"
import { cn } from "@/lib/utils"

type NumKey = "PERIOD_HOURS" | "WEEK_HOURS" | "EXCESS" | "CHRONIC"

interface SortState {
  key: NumKey
  desc: boolean
}

/** More OT than the previous window is the alert direction; no data keeps the default color. */
const deltaClass = (d: unknown) => (typeof d === "number" && d > 0 ? "text-destructive" : "")

const num = (r: RechartsRow, k: string) => (typeof r[k] === "number" ? (r[k] as number) : 0)

export function EmployeeOTTable({ config, data, onDrill, height }: ChartProps & { height: number }) {
  const [onlyOver, setOnlyOver] = useState(false)
  const [sort, setSort] = useState<SortState | null>(null)
  const block = readEmployeeOTBlock(config)
  const fmt = cfgStr(config, "number_format", "raw") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const currentPath = data.drillContext?.currentPath ?? []
  const canDrill = Boolean(data.drillContext?.canDrill) && Boolean(onDrill)
  const grouped = Boolean(block?.groupBy)
  const r = block?.ranges

  const columns: { key: NumKey; label: string; sub?: string; decimals?: number }[] = [
    { key: "PERIOD_HOURS", label: "Jam OT periode", sub: r ? fmtRange(r.periodFrom, r.periodTo) : undefined },
    { key: "WEEK_HOURS", label: "Jam hitung batas", sub: r ? `${r.weekLabel} · ${fmtRange(r.weekFrom, r.weekTo)}` : undefined },
    { key: "EXCESS", label: "Kelebihan > 14 jam" },
    { key: "CHRONIC", label: "Minggu berturut-turut", decimals: 0 },
  ]

  let rows = toRechartsRows(data)
  if (onlyOver) rows = rows.filter((x) => num(x, "EXCESS") > 0)
  if (sort) {
    const dir = sort.desc ? -1 : 1
    // Stable within the group order the backend returned; only the rank inside each group changes.
    rows = [...rows].sort((a, b) =>
      grouped && a.__group !== b.__group
        ? String(a.__group ?? "").localeCompare(String(b.__group ?? ""))
        : dir * (num(a, sort.key) - num(b, sort.key)),
    )
  }
  const subtotals = new Map(
    (onlyOver || !block ? localSubtotals(rows) : block.subtotals).map((s) => [s.group, s]),
  )

  const summary = onlyOver || !block?.summary ? localSummary(rows) : block.summary

  const fmtVal = (v: number, d?: number) => formatNumber(v, fmt, d ?? decimals)
  const toggleSort = (key: NumKey) =>
    setSort((s) => (s?.key === key ? (s.desc ? { key, desc: false } : null) : { key, desc: true }))
  const subtotalCell = (key: NumKey, s: EmployeeOTSubtotal) =>
    key === "CHRONIC" ? "" : fmtVal(s[key])
  const totalCols = 5 + columns.length

  return (
    <div className="space-y-2">
      <EmployeeOTKpiRow summary={summary} fmtHours={(v) => fmtVal(v)} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <label className="flex cursor-pointer items-center gap-2">
          <Checkbox checked={onlyOver} onCheckedChange={(v) => setOnlyOver(v === true)} aria-label="Hanya melebihi 14 jam" />
          Hanya melebihi 14 jam/minggu
        </label>
        <span>Total: {rows.length} karyawan</span>
        {block?.truncated && (
          <span className="text-amber-600 dark:text-amber-400">
            Dibatasi {block.maxRows} karyawan teratas; persempit dengan filter grup.
          </span>
        )}
      </div>
      <div className="overflow-auto" style={{ maxHeight: height }}>
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow>
              <TableHead>NIK</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Divisi</TableHead>
              <TableHead>Dept</TableHead>
              {columns.map((c) => (
                <TableHead key={c.key} className="text-right">
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => toggleSort(c.key)}>
                    {c.label}
                    {sort?.key === c.key && (sort.desc ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />)}
                  </button>
                  {c.sub && <div className="text-[10px] font-normal text-muted-foreground">{c.sub}</div>}
                </TableHead>
              ))}
              <TableHead className="text-right">
                vs periode lalu
                {r?.prevFrom && r.prevTo && (
                  <div className="text-[10px] font-normal text-muted-foreground">{fmtRange(r.prevFrom, r.prevTo)}</div>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => {
              const g = String(row.__group ?? "")
              const s = grouped && (i === 0 || rows[i - 1].__group !== row.__group) ? subtotals.get(g) : undefined
              return (
                <Fragment key={String(row.category)}>
                  {s && (
                    <TableRow className="bg-muted/60 font-semibold hover:bg-muted/60">
                      <TableCell colSpan={4}>
                        {GROUP_BY_LABELS[block?.groupBy ?? ""] ?? block?.groupBy}: {g || "(kosong)"}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {s.employees} karyawan · rata-rata {fmtVal(s.avg_period_hours)} jam · {formatNumber(s.over_pct, "raw", 1)}% over-limit
                        </span>
                      </TableCell>
                      {columns.map((c) => (
                        <TableCell key={c.key} className="text-right tabular-nums">
                          {subtotalCell(c.key, s)}
                        </TableCell>
                      ))}
                      <TableCell />
                    </TableRow>
                  )}
                  <TableRow
                    className={cn(canDrill ? "cursor-pointer hover:bg-muted/50" : "")}
                    onClick={canDrill ? () => onDrill?.([...currentPath, String(row.category)]) : undefined}
                  >
                    <TableCell className="font-mono text-xs">{row.category}</TableCell>
                    <TableCell>{String(row.__name || "—")}</TableCell>
                    <TableCell>{String(row.__division || "—")}</TableCell>
                    <TableCell>{String(row.__dept || "—")}</TableCell>
                    {columns.map((c) => (
                      <TableCell
                        key={c.key}
                        className={cn(
                          "text-right tabular-nums",
                          c.key === "EXCESS" && num(row, "EXCESS") > 0 && "font-semibold text-destructive",
                        )}
                      >
                        {fmtVal(num(row, c.key), c.decimals)}
                      </TableCell>
                    ))}
                    <TableCell className={cn("text-right tabular-nums", deltaClass(row.__delta_pct))} data-testid="employee-ot-row-delta">
                      {fmtDelta(typeof row.__delta_pct === "number" ? row.__delta_pct : null)}
                    </TableCell>
                  </TableRow>
                </Fragment>
              )
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={totalCols} className="py-6 text-center text-sm text-muted-foreground">
                  Tidak ada karyawan yang cocok dengan filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/** NIK → day drill: actual OT hours per day and the limit hours of the R2 week days. */
export function EmployeeOTDayTable({ config, data, height }: ChartProps & { height: number }) {
  const rows = toRechartsRows(data)
  const fmt = cfgStr(config, "number_format", "raw") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  return (
    <div className="overflow-auto" style={{ maxHeight: height }}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Jam OT aktual</TableHead>
            <TableHead className="text-right">Jam hitung batas (minggu R2)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={String(row.category)}>
              <TableCell>{fmtDay(String(row.category))}</TableCell>
              <TableCell className="text-right tabular-nums">{formatNumber(num(row, "ACTUAL"), fmt, decimals)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatNumber(num(row, "LIMIT"), fmt, decimals)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
