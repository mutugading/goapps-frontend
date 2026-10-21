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
    })),
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
