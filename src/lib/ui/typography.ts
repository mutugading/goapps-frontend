// Shared typography + density class constants so every Finance page renders
// the same heading sizes, table text, and metric styling. Import directly:
//   import { typography } from "@/lib/ui/typography"

export const typography = {
  pageTitle: "text-xl font-bold tracking-tight md:text-2xl",
  sectionTitle: "text-base font-semibold md:text-lg",
  cardTitle: "text-sm font-semibold",
  subtitle: "text-sm text-muted-foreground",
  metric: "text-2xl font-bold tabular-nums md:text-3xl",
  metricDelta: "text-xs text-muted-foreground",
  tableCell: "text-sm",
  tableHeader: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
  mono: "font-mono text-xs",
} as const;
