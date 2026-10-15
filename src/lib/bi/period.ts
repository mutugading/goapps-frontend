// FE period helpers — resolve presets to date ranges (for custom-range UI hints)
// and format period labels. Backend is authoritative for query windows; these are
// for client-side display and the custom-range picker.

import type { PeriodPreset } from "@/types/bi"

export interface ResolvedRange {
  from: Date | null
  to: Date | null
}

/** Resolve a preset into an approximate date range for UI display. ALL → null range. */
export function resolvePeriod(
  preset: PeriodPreset,
  customFrom?: string,
  customTo?: string,
  now: Date = new Date(),
  opts: { calendar?: string; grain?: string } = {}
): ResolvedRange {
  const payroll = opts.calendar === "PAYROLL_26_25"
  // WEEKLY facts belong to the payroll period containing their Sunday (K10).
  const monday = mondayOf(now)
  const refDay = opts.grain === "WEEKLY" ? new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6) : now
  switch (preset) {
    case "CUSTOM":
      return {
        from: customFrom ? new Date(customFrom) : null,
        to: customTo ? new Date(customTo) : null,
      }
    case "ALL":
      return { from: null, to: null }
    case "YESTERDAY": {
      const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      return { from: y, to: y }
    }
    case "THIS_MONTH":
      if (payroll) {
        const end = payrollEnd(refDay)
        return payrollWindow(payrollStart(end), end, opts.grain, now)
      }
      return { from: firstOfMonth(now), to: now }
    case "LAST_MONTH":
      if (payroll) {
        const cur = payrollEnd(refDay)
        const end = new Date(cur.getFullYear(), cur.getMonth() - 1, 25)
        return payrollWindow(payrollStart(end), end, opts.grain, now)
      }
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0),
      }
    case "THIS_WEEK":
      return { from: mondayOf(now), to: now }
    case "LAST_WEEK": {
      const thisMon = mondayOf(now)
      const lastMon = new Date(thisMon.getFullYear(), thisMon.getMonth(), thisMon.getDate() - 7)
      const lastSun = new Date(thisMon.getFullYear(), thisMon.getMonth(), thisMon.getDate() - 1)
      return { from: lastMon, to: lastSun }
    }
    case "THIS_QTR":
      return { from: firstOfQuarter(now), to: now }
    case "THIS_YEAR":
      return { from: new Date(now.getFullYear(), 0, 1), to: now }
    case "L24M":
      if (payroll) return payrollTrailing(24, opts.grain, now, refDay)
      return { from: shiftMonths(firstOfMonth(now), -24), to: now }
    case "L12M":
    default:
      if (payroll) return payrollTrailing(12, opts.grain, now, refDay)
      return { from: shiftMonths(firstOfMonth(now), -12), to: now }
  }
}

/** Format a YYYYMM / date string into a human label per grain. */
export function periodLabel(raw: string, grain: string): string {
  // ISO week label, e.g. "2026-W42" (backend format) — pass through.
  if (/^\d{4}-W\d{2}$/.test(raw)) return raw
  if (grain === "WEEKLY") return isoWeekLabel(raw) ?? raw
  // raw may be "202604" (monthly), "2026-04-15" (daily), "2026-Q2", "2026".
  if (/^\d{6}$/.test(raw)) {
    const year = raw.slice(0, 4)
    const month = parseInt(raw.slice(4, 6), 10)
    return `${MONTHS[month - 1] ?? "?"} ${year}`
  }
  if (grain === "QUARTERLY" || /Q/.test(raw)) return raw
  if (grain === "YEARLY") return raw
  return raw
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function firstOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
function firstOfQuarter(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) * 3
  return new Date(d.getFullYear(), q, 1)
}
function shiftMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1)
}

/** Monday (00:00 local) of the ISO week containing d. */
function mondayOf(d: Date): Date {
  const offset = (d.getDay() + 6) % 7
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset)
}

/** "2026-10-15" → "2026-W42" (ISO 8601 week; year is the ISO week-year). */
function isoWeekLabel(raw: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (!m) return null
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day) // Thursday of this week
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1)
  const week = Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`
}

// ---- Payroll calendar 26–25 (HD-06, K3, K10) — mirrors backend chartdata/period.go ----

/** The 25th that closes the payroll period containing d (from the 26th it is next month's 25th). */
function payrollEnd(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + (d.getDate() > 25 ? 1 : 0), 25)
}

/** The 26th of the previous month for a period ending on `end`. */
function payrollStart(end: Date): Date {
  return new Date(end.getFullYear(), end.getMonth() - 1, 26)
}

/** WEEKLY facts sit on Monday and belong to the period containing their Sunday → shift -6 days. */
function payrollWindow(start: Date, end: Date, grain: string | undefined, now: Date): ResolvedRange {
  if (grain === "WEEKLY") {
    return {
      from: new Date(start.getFullYear(), start.getMonth(), start.getDate() - 6),
      to: new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6),
    }
  }
  if (grain === "DAILY") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return { from: start, to: today < end ? today : end }
  }
  return { from: start, to: end }
}

function payrollTrailing(n: number, grain: string | undefined, now: Date, refDay: Date): ResolvedRange {
  const end = payrollEnd(refDay)
  const first = payrollStart(new Date(end.getFullYear(), end.getMonth() - (n - 1), 25))
  return payrollWindow(first, end, grain, now)
}
