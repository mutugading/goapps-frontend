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
