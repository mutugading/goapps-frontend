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
  now: Date = new Date()
): ResolvedRange {
  switch (preset) {
    case "CUSTOM":
      return {
        from: customFrom ? new Date(customFrom) : null,
        to: customTo ? new Date(customTo) : null,
      }
    case "ALL":
      return { from: null, to: null }
    case "THIS_MONTH":
      return { from: firstOfMonth(now), to: now }
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
      return { from: shiftMonths(firstOfMonth(now), -24), to: now }
    case "L12M":
    default:
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
