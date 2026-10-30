// FE period label formatting. Backend is authoritative for query windows
// (chartdata/period.go); preset → date range resolution lives only there.

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

/**
 * Derives YYYYMM period options for categorical charts (waterfall, bar, etc.) where chart
 * categories are group names, not period strings. Builds the last N months (12, or 24 for
 * L24M) anchored at the data's as-of date (or today), oldest-first.
 *
 * By default the list starts at the PREVIOUS month: for most dashboards the current month is
 * not fully loaded by ETL yet (e.g. June 4 2026 → May 2026 … Jun 2025). Workforce (HR_*) facts
 * are loaded per payroll period (26–25), so the current month already has data; pass
 * `includeCurrentMonth` to start at the as-of month itself.
 */
export function derivePeriodOptions(
  asOfDate: Date | undefined,
  periodPreset: string,
  includeCurrentMonth = false,
): string[] {
  const anchor = asOfDate ?? new Date()
  const year = anchor.getFullYear()
  const month = anchor.getMonth() // 0-indexed
  const count = periodPreset === "L24M" ? 24 : 12
  const start = includeCurrentMonth ? 0 : 1
  const result: string[] = []
  for (let i = start; i < start + count; i++) {
    const d = new Date(year, month - i, 1)
    result.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return result.reverse() // oldest first
}
