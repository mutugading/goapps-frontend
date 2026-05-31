"use client"

// Multi-series line chart for dashboards with metric_filter.include_metrics set
// (e.g. Delivery Margin: Gross Sales, Net Sales, Production Cost, Margin over time).
// Uses ECharts via echarts-for-react — consistent with waterfall.tsx.

import ReactECharts from "echarts-for-react"
import type { ChartProps } from "@/components/bi/chart-engine/types"
import { cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"

// Default color palette (series order: Gross→Net→Cost→Margin).
const DEFAULT_PALETTE = ["#1F4E79", "#2E75B6", "#a32d2d", "#1d9e75", "#534AB7", "#9CA3AF"]

export default function BiMultiLineChart({ config, data, height = 360 }: ChartProps) {
  const fmt = cfgStr(config, "number_format", "currency_thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const seriesColors = (config.series_colors ?? {}) as Record<string, string>

  const periods = data.categories ?? []
  const series = (data.series ?? []).map((s, i) => ({
    name: s.name,
    type: "line" as const,
    smooth: true,
    data: periods.map((p) => {
      const pt = s.points?.find((x) => x.category === p)
      return pt?.value ?? null
    }),
    itemStyle: { color: seriesColors[s.name] ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length] },
    lineStyle: { width: 2.5 },
    symbol: "circle",
    symbolSize: 5,
    connectNulls: false,
  }))

  const option = {
    tooltip: {
      trigger: "axis" as const,
      confine: true,
      formatter: (
        params: Array<{ seriesName: string; value: number | null; color: string; axisValueLabel?: string }>,
      ) => {
        if (!params.length) return ""
        const period = params[0].axisValueLabel ?? ""
        const lines = params
          .filter((p) => p.value != null)
          .map(
            (p) =>
              `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:4px"></span>${p.seriesName}: ${formatNumber(p.value as number, fmt, decimals)}`,
          )
        return `<b>${period}</b><br/>${lines.join("<br/>")}`
      },
    },
    legend: { type: "scroll" as const, bottom: 0, itemWidth: 14, itemHeight: 8 },
    grid: { top: 16, right: 16, bottom: 52, left: 8, containLabel: true },
    xAxis: {
      type: "category" as const,
      data: periods,
      axisLabel: { rotate: 25, fontSize: 11 },
      boundaryGap: false,
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => formatNumber(v, fmt, 0), fontSize: 11 },
    },
    series,
  }

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      notMerge={true}
      lazyUpdate={false}
      opts={{ renderer: "canvas" }}
    />
  )
}
