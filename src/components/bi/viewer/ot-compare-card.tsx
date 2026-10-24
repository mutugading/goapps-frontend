"use client"

// OT trend comparison card (H041): grouped bar (selected period vs MoM/YoY comparison, per OT type),
// Δ table per type sorted by largest increase, and each dept's contribution to the total Δ.
// Data comes from the /computed BFF (SUM of one metric grouped by group_2 / group_1) for two periods;
// Δ is computed here. A period with no series at all means "no data" (shown as such, never as 0).

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { ChartDataResponse } from "@/types/bi"
import { biColors } from "@/lib/bi/color-tokens"
import { formatNumber } from "@/lib/bi/number-format"

type CompareKey = "MoM" | "YoY"
type Totals = Map<string, number> | null // null = no data for that period

interface OtCompareCardProps {
  title?: string
  dashboardCode: string
  metric: string
  periodCalendar?: string
  selectedPeriod?: string
  decimals?: number
  span?: "full" | "half" | "third"
  group1Filter?: string[]
  group2Filter?: string[]
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function periodLabel(p: string): string {
  return `${MONTHS[parseInt(p.slice(4, 6), 10) - 1] ?? ""} ${p.slice(0, 4)}`
}

/** YYYYMM shifted back by one month (MoM) or twelve (YoY). */
export function comparePeriod(p: string, mode: CompareKey): string {
  const y = parseInt(p.slice(0, 4), 10)
  const m = parseInt(p.slice(4, 6), 10) - 1
  const t = mode === "YoY" ? y * 12 + m - 12 : y * 12 + m - 1
  return `${Math.floor(t / 12)}${String((t % 12) + 1).padStart(2, "0")}`
}

/** Series-major /computed payload (series.name = bucket, 1 point) → bucket totals, null when empty. */
export function toTotals(d: ChartDataResponse | undefined): Totals {
  const series = (d?.series ?? []).filter((s) => s.name)
  if (series.length === 0) return null
  return new Map(series.map((s) => [s.name, s.points?.[0]?.value ?? 0]))
}

export interface DeltaRow {
  key: string
  cur: number
  prev: number | null
  delta: number | null
  pct: number | null
}

/** Δ rows over the union of buckets, largest increase first. prev=null when the comparison has no data. */
export function buildDeltaRows(cur: Totals, prev: Totals): DeltaRow[] {
  const keys = new Set<string>([...(cur?.keys() ?? []), ...(prev?.keys() ?? [])])
  const rows = [...keys].map((key) => {
    const c = cur?.get(key) ?? 0
    const p = prev === null ? null : (prev.get(key) ?? 0)
    const delta = p === null ? null : c - p
    const pct = p === null || p === 0 ? null : ((c - p) / p) * 100
    return { key, cur: c, prev: p, delta, pct }
  })
  return rows.sort((a, b) => (b.delta ?? -Infinity) - (a.delta ?? -Infinity))
}

function fetchTotals(
  code: string, metric: string, groupBy: string, period: string, calendar: string | undefined,
  g1: string, g2: string,
): Promise<Totals> {
  const url = new URL(`/api/v1/finance/bi/dashboards/by-code/${code}/computed`, window.location.origin)
  url.searchParams.set("numerator", metric)
  url.searchParams.set("denominator", "")
  url.searchParams.set("scale", "1")
  url.searchParams.set("group_by", groupBy)
  url.searchParams.set("period", period)
  if (calendar) url.searchParams.set("period_calendar", calendar)
  if (g1) url.searchParams.set("group1_filter", g1)
  if (g2) url.searchParams.set("group2_filter", g2)
  return fetch(url.toString(), { credentials: "include" })
    .then((r) => r.json())
    .then((j: { data?: ChartDataResponse }) => toTotals(j.data))
    .catch(() => null)
}

function DeltaCell({ v, dec, suffix = "" }: { v: number | null; dec: number; suffix?: string }) {
  if (v === null) return <span className="text-muted-foreground">—</span>
  const cls = v > 0 ? "text-red-600" : v < 0 ? "text-emerald-600" : "text-muted-foreground"
  return (
    <span className={cn("tabular-nums", cls)}>
      {v > 0 ? "▲ +" : v < 0 ? "▼ " : ""}
      {formatNumber(v, "raw", dec)}
      {suffix}
    </span>
  )
}

export function OtCompareCard(props: OtCompareCardProps) {
  const { title, dashboardCode, metric, periodCalendar, selectedPeriod, span, group1Filter, group2Filter } = props
  const dec = props.decimals ?? 1
  const [mode, setMode] = useState<CompareKey>("MoM")
  const [result, setResult] = useState<{ key: string; types: [Totals, Totals]; depts: [Totals, Totals] } | null>(null)
  const g1 = (group1Filter ?? []).join(",")
  const g2 = (group2Filter ?? []).join(",")
  const validPeriod = selectedPeriod && /^\d{6}$/.test(selectedPeriod) ? selectedPeriod : undefined
  const prevPeriod = validPeriod ? comparePeriod(validPeriod, mode) : undefined
  const reqKey = `${dashboardCode}|${metric}|${periodCalendar ?? ""}|${validPeriod ?? ""}|${prevPeriod ?? ""}|${g1}|${g2}`
  // Stale result (key mismatch) counts as loading, so no setState is needed to reset on change.
  const loaded = result?.key === reqKey ? result : null

  useEffect(() => {
    if (!validPeriod || !prevPeriod) return
    let cancelled = false
    const get = (by: string, p: string) => fetchTotals(dashboardCode, metric, by, p, periodCalendar, g1, g2)
    void Promise.all([
      get("group_2", validPeriod), get("group_2", prevPeriod),
      get("group_1", validPeriod), get("group_1", prevPeriod),
    ]).then(([tc, tp, dc, dp]) => {
      if (!cancelled) setResult({ key: reqKey, types: [tc, tp], depts: [dc, dp] })
    })
    return () => { cancelled = true }
  }, [reqKey, dashboardCode, metric, periodCalendar, validPeriod, prevPeriod, g1, g2])

  const typeRows = loaded ? buildDeltaRows(...loaded.types) : []
  const deptRows = loaded ? buildDeltaRows(...loaded.depts) : []
  const noPrev = loaded !== null && loaded.types[1] === null
  const totalCur = typeRows.reduce((a, r) => a + r.cur, 0)
  const totalDelta = noPrev ? null : typeRows.reduce((a, r) => a + (r.delta ?? 0), 0)
  const curLabel = validPeriod ? periodLabel(validPeriod) : ""
  const prevLabel = prevPeriod ? periodLabel(prevPeriod) : ""
  const barData = typeRows.map((r) => ({ category: r.key, [curLabel]: r.cur, [prevLabel]: r.prev ?? 0 }))

  return (
    <Card className={cn(span === "full" && "lg:col-span-2")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold">
          {title ?? "Perbandingan periode"}
          {validPeriod && <span className="ml-2 text-xs font-normal text-muted-foreground">— {curLabel} vs {prevLabel}</span>}
        </CardTitle>
        <div className="flex gap-1">
          {(["MoM", "YoY"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded border px-2 py-0.5 text-xs",
                mode === m ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!validPeriod ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Pilih periode untuk membandingkan.</p>
        ) : loaded === null ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">Loading…</div>
        ) : (
          <>
            {noPrev && (
              <p className="rounded border border-dashed px-3 py-2 text-xs text-muted-foreground">
                Data {mode} ({prevLabel}) belum ada, jadi selisih tidak dapat dihitung.
              </p>
            )}
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v, "raw", 0)} />
                <Tooltip formatter={(v: number) => formatNumber(v, "raw", dec)} />
                <Legend />
                <Bar dataKey={curLabel} fill={biColors.primary} radius={[3, 3, 0, 0]} />
                {!noPrev && <Bar dataKey={prevLabel} fill="#94a3b8" radius={[3, 3, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>

            <div className="grid gap-4 lg:grid-cols-2">
              <DeltaTable heading="Δ per tipe OT (kenaikan terbesar dulu)" first="Tipe" rows={typeRows}
                curLabel={curLabel} prevLabel={prevLabel} dec={dec} />
              <DeltaTable heading="Kontribusi dept ke Δ total" first="Dept" rows={deptRows}
                curLabel={curLabel} prevLabel={prevLabel} dec={dec} totalDelta={totalDelta} totalCur={totalCur} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function DeltaTable({ heading, first, rows, curLabel, prevLabel, dec, totalDelta, totalCur }: {
  heading: string; first: string; rows: DeltaRow[]; curLabel: string; prevLabel: string; dec: number
  totalDelta?: number | null; totalCur?: number
}) {
  const showShare = totalDelta !== undefined
  return (
    <div className="min-w-0 space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{heading}</div>
      <div className="max-h-[320px] overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{first}</TableHead>
              <TableHead className="text-right">{curLabel}</TableHead>
              <TableHead className="text-right">{prevLabel}</TableHead>
              <TableHead className="text-right">Δ jam</TableHead>
              <TableHead className="text-right">Δ%</TableHead>
              {showShare && <TableHead className="text-right">Kontribusi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.key}>
                <TableCell>{r.key}</TableCell>
                <TableCell className="text-right tabular-nums">{formatNumber(r.cur, "raw", dec)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.prev === null ? <span className="text-muted-foreground">—</span> : formatNumber(r.prev, "raw", dec)}
                </TableCell>
                <TableCell className="text-right"><DeltaCell v={r.delta} dec={dec} /></TableCell>
                <TableCell className="text-right"><DeltaCell v={r.pct} dec={1} suffix="%" /></TableCell>
                {showShare && (
                  <TableCell className="text-right tabular-nums">
                    {r.delta === null || !totalDelta ? "—" : `${formatNumber((r.delta / totalDelta) * 100, "raw", 0)}%`}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={showShare ? 6 : 5} className="text-center text-muted-foreground">Belum ada data</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showShare && totalDelta !== undefined && (
        <div className="text-xs text-muted-foreground">
          Total {formatNumber(totalCur ?? 0, "raw", dec)} jam · Δ total{" "}
          {totalDelta === null ? "—" : <DeltaCell v={totalDelta} dec={dec} />}
        </div>
      )}
    </div>
  )
}
