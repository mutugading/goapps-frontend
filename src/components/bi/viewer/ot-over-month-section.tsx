"use client"

// Over-limit monthly trend on top of Kepatuhan 14 Jam (H042, HD-22). Bars = orang-minggu per payroll month,
// line = karyawan unik (two different measures, never summed). Click a month to filter the weekly heatmap/table
// below (via onSelectMonth), then drill dept → orang (NIK, needs workforceemployee.view; the backend gates it too).

import { useEffect, useState } from "react"
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { ChartDataResponse } from "@/types/bi"
import { biColors } from "@/lib/bi/color-tokens"
import { formatNumber } from "@/lib/bi/number-format"
import { usePermission } from "@/lib/hooks/use-permission"

export interface OtOverMonthConfig {
  trend_dashboard: string
  emp_dashboard: string
  nik_dashboard: string
  period_calendar?: string
}

interface Props {
  config: OtOverMonthConfig
  selectedPeriod?: string
  onSelectMonth: (period: string | undefined) => void
}

const BASE = "/api/v1/finance/bi/dashboards/by-code"

/** Trend payload → map label (YYYYMM) → value of the first series. */
export function toMonthMap(d: ChartDataResponse | undefined): Map<string, number> {
  const out = new Map<string, number>()
  const s = d?.series?.[0]
  const cats = d?.categories ?? []
  ;(s?.points ?? []).forEach((p, i) => {
    const key = /^\d{6}$/.test(p.category ?? "") ? p.category : cats[i]
    if (key) out.set(key, (out.get(key) ?? 0) + p.value)
  })
  return out
}

/** /computed payload → [category, value] rows, largest first. */
export function toRanked(d: ChartDataResponse | undefined): Array<[string, number]> {
  const out = new Map<string, number>()
  for (const s of d?.series ?? []) {
    for (const p of s.points ?? []) {
      const key = p.category || s.name
      if (key) out.set(key, (out.get(key) ?? 0) + p.value)
    }
  }
  return [...out.entries()].sort((a, b) => b[1] - a[1])
}

/** null = request failed or was refused (403/5xx), so the UI shows an error instead of "no data". */
async function getJson(url: string): Promise<ChartDataResponse | null> {
  try {
    const r = await fetch(url, { credentials: "include" })
    if (!r.ok) return null
    const j = (await r.json()) as { data?: ChartDataResponse }
    return j.data ?? null
  } catch {
    return null
  }
}

function trendUrl(code: string, calendar?: string) {
  const q = new URLSearchParams({ period: "L12M", force_trend: "true" })
  if (calendar) q.set("period_calendar", calendar)
  return `${BASE}/${code}/data?${q.toString()}`
}

function computedUrl(code: string, groupBy: string, period: string, calendar?: string, group1?: string) {
  const q = new URLSearchParams({ numerator: "VALUE", denominator: "", scale: "1", group_by: groupBy, period })
  if (calendar) q.set("period_calendar", calendar)
  if (group1) q.set("group1_filter", group1)
  return `${BASE}/${code}/computed?${q.toString()}`
}

function RankTable({ first, rows, onPick }: { first: string; rows: Array<[string, number]>; onPick?: (k: string) => void }) {
  return (
    <div className="max-h-64 overflow-auto rounded border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{first}</TableHead>
            <TableHead className="text-right">Minggu over-limit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Tidak ada data</TableCell></TableRow>
          )}
          {rows.map(([k, v]) => (
            <TableRow key={k} className={cn(onPick && "cursor-pointer hover:bg-muted/50")} onClick={onPick ? () => onPick(k) : undefined}>
              <TableCell>{k}</TableCell>
              <TableCell className="text-right tabular-nums">{formatNumber(v, "raw", 0)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function OtOverMonthSection({ config, selectedPeriod, onSelectMonth }: Props) {
  const { hasPermission } = usePermission()
  const canEmployee = hasPermission("finance.bi.workforceemployee.view")
  const cal = config.period_calendar
  const [trend, setTrend] = useState<{ weeks: Map<string, number>; emps: Map<string, number> } | "error" | null>(null)
  const [depts, setDepts] = useState<{ key: string; rows: Array<[string, number]> | "error" } | null>(null)
  const [niks, setNiks] = useState<{ key: string; rows: Array<[string, number]> | "error" } | null>(null)
  // The picked dept belongs to the month it was picked in, so changing the month elsewhere (FilterBar) drops it.
  const [pick, setPick] = useState<{ period: string; dept: string } | undefined>()
  const valid = selectedPeriod && /^\d{6}$/.test(selectedPeriod) ? selectedPeriod : undefined

  const dept = pick && pick.period === valid ? pick.dept : undefined
  const setDept = (d: string | undefined) => setPick(d && valid ? { period: valid, dept: d } : undefined)

  useEffect(() => {
    let off = false
    void Promise.all([getJson(trendUrl(config.trend_dashboard, cal)), getJson(trendUrl(config.emp_dashboard, cal))]).then(
      ([w, e]) => { if (!off) setTrend(w === null || e === null ? "error" : { weeks: toMonthMap(w), emps: toMonthMap(e) }) },
    )
    return () => { off = true }
  }, [config.trend_dashboard, config.emp_dashboard, cal])

  const deptKey = valid ? `${config.trend_dashboard}|${valid}` : ""
  useEffect(() => {
    if (!valid) return
    let off = false
    void getJson(computedUrl(config.trend_dashboard, "group_1", valid, cal)).then((d) => {
      if (!off) setDepts({ key: deptKey, rows: d === null ? "error" : toRanked(d) })
    })
    return () => { off = true }
  }, [valid, deptKey, config.trend_dashboard, cal])

  const nikKey = valid && dept ? `${deptKey}|${dept}` : ""
  useEffect(() => {
    if (!valid || !dept || !canEmployee) return
    let off = false
    void getJson(computedUrl(config.nik_dashboard, "group_3", valid, cal, dept)).then((d) => {
      if (!off) setNiks({ key: nikKey, rows: d === null ? "error" : toRanked(d) })
    })
    return () => { off = true }
  }, [valid, dept, canEmployee, nikKey, config.nik_dashboard, cal])

  const ok = trend !== null && trend !== "error" ? trend : null
  const months = ok ? [...ok.weeks.keys()].sort() : []
  const chart = months.map((m) => ({ period: m, weeks: ok?.weeks.get(m) ?? 0, emps: ok?.emps.get(m) ?? 0 }))
  const deptRows = depts?.key === deptKey ? depts.rows : null
  const nikRows = niks?.key === nikKey ? niks.rows : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold">Tren Over-limit per Bulan Payroll</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Orang-minggu = jumlah kejadian (satu orang over-limit di 3 minggu dihitung 3). Karyawan unik = jumlah orang
            berbeda (orang yang sama dihitung 1 per bulan); tidak boleh dijumlah antar bulan atau dept.
            Klik bulan untuk memfilter minggu-minggunya di bawah.
          </p>
        </div>
        {valid && (
          <button type="button" className="rounded border px-2 py-0.5 text-xs" onClick={() => onSelectMonth(undefined)}>
            Semua bulan
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {trend === null ? (
          <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">Loading…</div>
        ) : trend === "error" ? (
          <p className="py-6 text-center text-sm text-destructive">Gagal memuat tren over-limit. Coba muat ulang.</p>
        ) : chart.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data over-limit</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={chart}
              margin={{ top: 16, right: 16, bottom: 8, left: 8 }}
              onClick={(e) => {
                const p = (e as { activeLabel?: string } | undefined)?.activeLabel
                if (p) onSelectMonth(p === valid ? undefined : p)
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatNumber(v, "raw", 0)} />
              <Legend />
              <Bar dataKey="weeks" name="Orang-minggu" fill={biColors.primary} radius={[3, 3, 0, 0]} />
              <Line dataKey="emps" name="Karyawan unik" stroke="#f59e0b" strokeWidth={2} dot />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {valid && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Dept, bulan {valid} {canEmployee && "(klik dept untuk melihat karyawan)"}
              </p>
              {deptRows === null ? <p className="text-sm text-muted-foreground">Loading…</p> : deptRows === "error" ? (
                <p className="text-sm text-destructive">Gagal memuat data dept.</p>
              ) : (
                <RankTable first="Dept" rows={deptRows} onPick={canEmployee ? setDept : undefined} />
              )}
            </div>
            {canEmployee && dept && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Karyawan di {dept}, bulan {valid}</p>
                {nikRows === null ? <p className="text-sm text-muted-foreground">Loading…</p> : nikRows === "error" ? (
                  <p className="text-sm text-destructive">Gagal memuat data karyawan.</p>
                ) : (
                  <RankTable first="NIK" rows={nikRows} />
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
