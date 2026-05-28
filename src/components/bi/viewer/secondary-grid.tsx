"use client"

// Secondary chart grid — renders the optional layout_config.secondary_charts as
// additional ChartEngine instances driven by the same payload as the main chart.
//
// MVP scope: secondary charts reuse the main data payload (no separate fetch). This
// covers the seeded "Net Profit vs EBITDA" line + "Monthly Detail" table use cases.

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ChartDataResponse } from "@/types/bi"
import { ChartEngine } from "@/components/bi/chart-engine/chart-engine"

interface SecondaryChartDef {
  title?: string
  chart_type?: string
  available_chart_types?: string[]
  chart_config?: Record<string, unknown>
  span?: "full" | "half" | "third"
}

interface SecondaryGridProps {
  layoutConfig: Record<string, unknown> | null
  data: ChartDataResponse
  /**
   * When set, data_table secondary charts are filtered to show only the points
   * whose category matches this period (YYYYMM). Other chart types are unaffected.
   */
  selectedPeriod?: string
}

function humanizeType(t: string): string {
  const labels: Record<string, string> = {
    line: "Line",
    bar: "Bar",
    area: "Area",
    data_table: "Table",
    waterfall: "Waterfall",
    multi_line: "Multi-Line",
  }
  return labels[t] ?? t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())
}

export function SecondaryGrid({ layoutConfig, data, selectedPeriod }: SecondaryGridProps) {
  const secondary = (layoutConfig?.secondary_charts as SecondaryChartDef[] | undefined) ?? []
  const [cardTypes, setCardTypes] = useState<Record<number, string>>({})

  if (secondary.length === 0) return null

  const getActiveType = (s: SecondaryChartDef, i: number): string =>
    cardTypes[i] ?? s.chart_type ?? "line"

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {secondary.map((s, i) => {
        const activeType = getActiveType(s, i)

        // For data_table charts, filter points to the selected period (client-side only).
        const filteredData =
          selectedPeriod && activeType === "data_table"
            ? {
                ...data,
                series: data.series?.map((ser) => ({
                  ...ser,
                  points: (ser.points ?? []).filter((p) => p.category === selectedPeriod),
                })) ?? [],
              }
            : data

        return (
          <Card
            key={`${s.title ?? "chart"}-${i}`}
            className={cn(s.span === "full" && "lg:col-span-2")}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  {s.title ?? "Detail"}
                  {selectedPeriod && activeType === "data_table" && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">— {selectedPeriod}</span>
                  )}
                </CardTitle>
                {(s.available_chart_types ?? []).length > 0 && (
                  <select
                    value={activeType}
                    onChange={(e) => setCardTypes((prev) => ({ ...prev, [i]: e.target.value }))}
                    className="rounded border border-border bg-background px-2 py-0.5 text-xs"
                  >
                    <option value={s.chart_type ?? "line"}>{humanizeType(s.chart_type ?? "line")}</option>
                    {(s.available_chart_types ?? []).map((t) => (
                      <option key={t} value={t}>{humanizeType(t)}</option>
                    ))}
                  </select>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ChartEngine
                chartType={activeType}
                config={s.chart_config ?? {}}
                data={filteredData}
                height={280}
              />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
