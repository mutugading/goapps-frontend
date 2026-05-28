"use client"

// Secondary chart grid — renders the optional layout_config.secondary_charts as
// additional ChartEngine instances driven by the same payload as the main chart.
//
// MVP scope: secondary charts reuse the main data payload (no separate fetch). This
// covers the seeded "Net Profit vs EBITDA" line + "Monthly Detail" table use cases.

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ChartDataResponse } from "@/types/bi"
import { ChartEngine } from "@/components/bi/chart-engine/chart-engine"

interface SecondaryChartDef {
  title?: string
  chart_type?: string
  chart_config?: Record<string, unknown>
  span?: "full" | "half" | "third"
}

interface SecondaryGridProps {
  layoutConfig: Record<string, unknown> | null
  data: ChartDataResponse
}

export function SecondaryGrid({ layoutConfig, data }: SecondaryGridProps) {
  const secondary = (layoutConfig?.secondary_charts as SecondaryChartDef[] | undefined) ?? []
  if (secondary.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {secondary.map((s, i) => (
        <Card
          key={`${s.title ?? "chart"}-${i}`}
          className={cn(s.span === "full" && "lg:col-span-2")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{s.title ?? "Detail"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartEngine
              chartType={s.chart_type ?? "line"}
              config={s.chart_config ?? {}}
              data={data}
              height={280}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
