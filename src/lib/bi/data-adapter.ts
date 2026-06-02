// Adapters that turn the backend ChartDataResponse (series-major) into the
// row-major shape Recharts expects, plus small helpers shared by chart components.

import type { ChartDataResponse, Series } from "@/types/bi"

// RechartsRow: row-major shape for Recharts. Keys are series names + "category".
// Meta fields from SeriesPoint.meta are copied with __ prefix (e.g. __denom_val).
export interface RechartsRow {
  category: string
  [seriesName: string]: string | number
}

/**
 * Pivot a series-major payload into row-major data for Recharts.
 *
 * Input: series=[{name:"Net Profit", points:[{category:"Jan", value:1}]}, ...]
 * Output: [{category:"Jan", "Net Profit":1, "YoY Previous":0.9}, ...]
 *
 * Categories come from data.categories to preserve order; missing points are 0.
 */
export function toRechartsRows(data: ChartDataResponse): RechartsRow[] {
  const categories = data.categories ?? []
  const rows: RechartsRow[] = categories.map((c) => ({ category: c }))
  const indexByCat = new Map(categories.map((c, i) => [c, i]))

  for (const s of data.series ?? []) {
    for (const p of s.points ?? []) {
      const idx = indexByCat.get(p.category)
      if (idx === undefined) continue
      rows[idx][s.name] = p.value
      // Copy meta fields with __ prefix so they're accessible in tooltips
      // but not accidentally rendered as chart bars/lines.
      if (p.meta) {
        for (const [k, v] of Object.entries(p.meta)) {
          rows[idx][`__${k}`] = v
        }
      }
    }
  }
  return rows
}

/** Series names in order (used to render <Bar>/<Line> per series). */
export function seriesNames(data: ChartDataResponse): string[] {
  return (data.series ?? []).map((s) => s.name)
}

/** The primary (first) series, or undefined when empty. */
export function primarySeries(data: ChartDataResponse): Series | undefined {
  return (data.series ?? [])[0]
}

/** True when the payload has no data points to render. */
export function isEmpty(data: ChartDataResponse | undefined): boolean {
  if (!data) return true
  const first = (data.series ?? [])[0]
  return !first || (first.points?.length ?? 0) === 0
}

/** Read a string config value with fallback. */
export function cfgStr(config: Record<string, unknown>, key: string, fallback = ""): string {
  const v = config[key]
  return typeof v === "string" ? v : fallback
}

/** Read a numeric config value with fallback. */
export function cfgNum(config: Record<string, unknown>, key: string, fallback = 0): number {
  const v = config[key]
  return typeof v === "number" ? v : fallback
}

/** Read a boolean config value with fallback. */
export function cfgBool(config: Record<string, unknown>, key: string, fallback = false): boolean {
  const v = config[key]
  return typeof v === "boolean" ? v : fallback
}
