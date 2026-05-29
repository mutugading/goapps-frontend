"use client"

// Secondary chart grid — renders the optional layout_config.secondary_charts as
// additional ChartEngine instances driven by the same payload as the main chart.
//
// Cards with source_dashboard_code trigger a cross-dashboard fetch: they merge the
// primary series (renamed to primary_series_label) with a second series fetched from
// the referenced dashboard (renamed to source_series_label), then render a dual_line chart.

import { useState, useEffect } from "react"
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
  source_dashboard_code?: string
  source_series_label?: string
  primary_series_label?: string
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
    dual_line: "Dual-Line",
  }
  return labels[t] ?? t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// CrossDashboardCard fetches a secondary dashboard's data and merges it with the
// primary series before rendering the chart.
function CrossDashboardCard({
  s,
  primaryData,
  cardIndex,
  cardTypes,
  setCardTypes,
  height,
}: {
  s: SecondaryChartDef
  primaryData: ChartDataResponse
  cardIndex: number
  cardTypes: Record<number, string>
  setCardTypes: React.Dispatch<React.SetStateAction<Record<number, string>>>
  height: number
}) {
  const [secondaryData, setSecondaryData] = useState<ChartDataResponse | null>(null)
  const code = s.source_dashboard_code!

  useEffect(() => {
    fetch(`/api/v1/finance/bi/dashboards/by-code/${code}/data?period=L24M`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j: { data?: ChartDataResponse }) => {
        if (j.data) setSecondaryData(j.data)
      })
      .catch(() => {})
  }, [code])

  const primaryLabel = s.primary_series_label ?? primaryData.series?.[0]?.name ?? "Primary"
  const secondaryLabel = s.source_series_label ?? code

  // Align secondary series points to primary categories.
  const cats = primaryData.categories ?? []
  const mergedSeries = [
    ...(primaryData.series?.slice(0, 1).map((ser) => ({ ...ser, name: primaryLabel })) ?? []),
    ...(secondaryData?.series?.slice(0, 1).map((ser) => ({ ...ser, name: secondaryLabel })) ?? []),
  ]
  const mergedData: ChartDataResponse = { ...primaryData, series: mergedSeries, categories: cats }

  const activeType = cardTypes[cardIndex] ?? s.chart_type ?? "dual_line"

  return (
    <Card className={cn(s.span === "full" && "lg:col-span-2")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{s.title ?? "Detail"}</CardTitle>
          {(s.available_chart_types ?? []).length > 0 && (
            <select
              value={activeType}
              onChange={(e) => setCardTypes((prev) => ({ ...prev, [cardIndex]: e.target.value }))}
              className="rounded border border-border bg-background px-2 py-0.5 text-xs"
            >
              <option value={s.chart_type ?? "dual_line"}>{humanizeType(s.chart_type ?? "dual_line")}</option>
              {(s.available_chart_types ?? []).map((t) => (
                <option key={t} value={t}>
                  {humanizeType(t)}
                </option>
              ))}
            </select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {secondaryData === null ? (
          <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          <ChartEngine
            chartType={activeType}
            config={(s.chart_config ?? {}) as Record<string, unknown>}
            data={mergedData}
            height={height}
          />
        )}
      </CardContent>
    </Card>
  )
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
        // Cross-dashboard cards get their own component that fetches secondary data.
        if (s.source_dashboard_code) {
          return (
            <CrossDashboardCard
              key={`${s.title ?? "chart"}-${i}`}
              s={s}
              primaryData={data}
              cardIndex={i}
              cardTypes={cardTypes}
              setCardTypes={setCardTypes}
              height={280}
            />
          )
        }

        const activeType = getActiveType(s, i)

        // For data_table charts, filter points to the selected period (client-side only).
        const filteredData =
          selectedPeriod && activeType === "data_table"
            ? {
                ...data,
                series:
                  data.series?.map((ser) => ({
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
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      — {selectedPeriod}
                    </span>
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
                      <option key={t} value={t}>
                        {humanizeType(t)}
                      </option>
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
