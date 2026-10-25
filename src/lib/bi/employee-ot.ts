// Employee Overtime table (table_mode=employee_ot, HD-18): helpers over the "employee_ot" block the
// backend adds to the response config (group options, subtotals, truncated flag, column ranges).

import type { ChartDataResponse, PeriodPreset } from "@/types/bi"

export const EMPLOYEE_OT_MODE = "employee_ot"

/** Presets the backend accepts for employee_ot (payroll periods only; week/day presets are rejected). */
export const EMPLOYEE_OT_PRESETS: PeriodPreset[] = ["THIS_MONTH", "LAST_MONTH", "THIS_QTR", "THIS_YEAR", "L12M"]

export interface EmployeeOTSubtotal {
  group: string
  employees: number
  PERIOD_HOURS: number
  WEEK_HOURS: number
  EXCESS: number
  /** Average period hours per employee, 1 decimal (HD-24). */
  avg_period_hours: number
  /** Share of employees with EXCESS > 0, percent, 1 decimal (HD-24). */
  over_pct: number
}

export interface EmployeeOTSummary {
  employees: number
  totalPeriodHours: number
  overLimit: number
  chronic: number
}

export interface EmployeeOTRanges {
  periodFrom: string
  periodTo: string
  lastPeriodFrom: string
  dayFrom: string
  weekFrom: string
  weekTo: string
  weekLabel: string
}

export interface EmployeeOTBlock {
  groupBy: string
  groupOptions: string[]
  truncated: boolean
  maxRows: number
  subtotals: EmployeeOTSubtotal[]
  summary?: EmployeeOTSummary
  ranges?: EmployeeOTRanges
}

export const GROUP_BY_LABELS: Record<string, string> = {
  DIVISION: "Divisi",
  DEPT: "Dept",
  COMPANY: "Company",
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0)

/** Read the employee_ot block from a response config; undefined when absent (day drill, other modes). */
export function readEmployeeOTBlock(config: Record<string, unknown> | undefined): EmployeeOTBlock | undefined {
  const raw = config?.["employee_ot"] ?? config?.["employeeOt"]
  if (!raw || typeof raw !== "object") return undefined
  const b = raw as Record<string, unknown>
  const r = b.ranges as Record<string, unknown> | undefined
  const sm = b.summary && typeof b.summary === "object" ? (b.summary as Record<string, unknown>) : undefined
  return {
    groupBy: str(b.group_by),
    groupOptions: Array.isArray(b.group_options) ? b.group_options.filter((x): x is string => typeof x === "string") : [],
    truncated: b.truncated === true,
    maxRows: num(b.max_rows),
    subtotals: (Array.isArray(b.subtotals) ? b.subtotals : []).map((s: Record<string, unknown>) => ({
      group: str(s.group),
      employees: num(s.employees),
      PERIOD_HOURS: num(s.PERIOD_HOURS),
      WEEK_HOURS: num(s.WEEK_HOURS),
      EXCESS: num(s.EXCESS),
      avg_period_hours: num(s.avg_period_hours),
      over_pct: num(s.over_pct),
    })),
    summary: sm
      ? {
          employees: num(sm.employees),
          totalPeriodHours: num(sm.total_period_hours),
          overLimit: num(sm.over_limit),
          chronic: num(sm.chronic),
        }
      : undefined,
    ranges: r
      ? {
          periodFrom: str(r.period_from),
          periodTo: str(r.period_to),
          lastPeriodFrom: str(r.last_period_from),
          dayFrom: str(r.day_from),
          weekFrom: str(r.week_from),
          weekTo: str(r.week_to),
          weekLabel: str(r.week_label),
        }
      : undefined,
  }
}

/** Round half-up to 1 decimal, same as the backend (math.Round on non-negative values). */
const round1 = (v: number) => Math.round(v * 10) / 10

/** Row shape localSubtotals needs: point values plus the group carried by the adapter. */
type OTRow = Record<string, unknown>

/** Subtotals per group over the given rows, first-seen order. Used when rows are filtered client-side. */
export function localSubtotals(rows: OTRow[]): EmployeeOTSubtotal[] {
  const n = (r: OTRow, k: string) => (typeof r[k] === "number" ? (r[k] as number) : 0)
  const by = new Map<string, EmployeeOTSubtotal & { over: number }>()
  for (const r of rows) {
    const g = String(r.__group ?? "")
    const s = by.get(g) ?? {
      group: g, employees: 0, PERIOD_HOURS: 0, WEEK_HOURS: 0, EXCESS: 0, avg_period_hours: 0, over_pct: 0, over: 0,
    }
    s.employees++
    s.PERIOD_HOURS += n(r, "PERIOD_HOURS")
    s.WEEK_HOURS += n(r, "WEEK_HOURS")
    s.EXCESS += n(r, "EXCESS")
    if (n(r, "EXCESS") > 0) s.over++
    by.set(g, s)
  }
  return [...by.values()].map(({ over, ...s }) => ({
    ...s,
    avg_period_hours: round1(s.PERIOD_HOURS / s.employees),
    over_pct: round1((over / s.employees) * 100),
  }))
}

/** Summary over the given rows, same definitions as the backend (HD-24): over-limit = EXCESS > 0,
 *  chronic = CHRONIC > 0, both counted per person. Used when rows are filtered client-side. */
export function localSummary(rows: OTRow[]): EmployeeOTSummary {
  const n = (r: OTRow, k: string) => (typeof r[k] === "number" ? (r[k] as number) : 0)
  return {
    employees: rows.length,
    totalPeriodHours: round1(rows.reduce((a, r) => a + n(r, "PERIOD_HOURS"), 0)),
    overLimit: rows.filter((r) => n(r, "EXCESS") > 0).length,
    chronic: rows.filter((r) => n(r, "CHRONIC") > 0).length,
  }
}

/** Distinct group values in the table rows (point meta.group), sorted. Source of the group filter (HD-18). */
export function employeeOTGroupValues(data: ChartDataResponse | undefined): string[] {
  const seen = new Set<string>()
  for (const p of data?.series?.[0]?.points ?? []) {
    const g = p.meta?.["group"]
    if (typeof g === "string") seen.add(g)
  }
  return [...seen].sort()
}

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

/** "2026-09-26" → "26 Sep 2026". Unparseable input is returned as-is. */
export function fmtDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return `${Number(m[3])} ${MONTHS_ID[Number(m[2]) - 1] ?? ""} ${m[1]}`
}

/** "26 Sep 2026 – 25 Okt 2026"; empty when either end is missing. */
export function fmtRange(from: string, to: string): string {
  return from && to ? `${fmtDay(from)} – ${fmtDay(to)}` : ""
}
