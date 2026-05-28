// BI chart color tokens — aligned with shadcn theme CSS variables where possible,
// with explicit hex fallbacks for ECharts (which can't read CSS vars at runtime).

export const biColors = {
  primary: "#1F4E79",
  positive: "#1d9e75",
  negative: "#a32d2d",
  total: "#534AB7",
  neutral: "#6B7280",
  // Categorical palette for multi-series charts.
  series: ["#1F4E79", "#2E75B6", "#1d9e75", "#BA7517", "#534AB7", "#a32d2d", "#0891b2", "#9333ea"],
}

/** Resolve a config color key with a fallback. */
export function colorOr(config: Record<string, unknown>, key: string, fallback: string): string {
  const v = config[key]
  return typeof v === "string" && v ? v : fallback
}

/** Pick the Nth series color, cycling through the palette. */
export function seriesColor(index: number): string {
  return biColors.series[index % biColors.series.length]
}
