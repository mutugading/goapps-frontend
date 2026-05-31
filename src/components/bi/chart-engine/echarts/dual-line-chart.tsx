"use client"

// Dual-line chart for cross-dashboard comparisons (e.g. Net Profit vs EBITDA).
// Renders two series from separate data sources on one shared time axis using ECharts.

import ReactECharts from "echarts-for-react"
import type { ChartProps } from "@/components/bi/chart-engine/types"
import { cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"

const DEFAULT_COLORS = ["#1d9e75", "#534AB7", "#1F4E79", "#a32d2d"]

export default function BiDualLineChart({ config, data, height = 280 }: ChartProps) {
  const fmt = cfgStr(config, "number_format", "currency_thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const colorMap = (config.colors ?? {}) as Record<string, string>

  const periods = data.categories ?? []
  const series = (data.series ?? []).map((s, i) => ({
    name: s.name,
    type: "line" as const,
    smooth: true,
    data: periods.map((p) => {
      const pt = s.points?.find((x) => x.category === p)
      return pt?.value ?? null
    }),
    itemStyle: { color: colorMap[s.name] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] },
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
    grid: { top: 8, right: 16, bottom: 48, left: 8, containLabel: true },
    xAxis: {
      type: "category" as const,
      data: periods,
      axisLabel: { rotate: 25, fontSize: 10 },
      boundaryGap: false,
    },
    yAxis: {
      type: "value" as const,
      axisLabel: { formatter: (v: number) => formatNumber(v, fmt, 0), fontSize: 10 },
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
