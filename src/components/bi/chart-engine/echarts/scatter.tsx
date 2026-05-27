"use client"

import ReactECharts from "echarts-for-react"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { seriesColor } from "@/lib/bi/color-tokens"

export default function BiScatterChart({ config, data, height = 360 }: ChartProps) {
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const fmtAxis = (v: number) => formatNumber(v, fmt, decimals)

  // Each series → a scatter group. Point.value = y; the index is x (period-ordered).
  const seriesList = data.series ?? []

  const option = {
    grid: { left: "3%", right: "4%", top: 24, bottom: 50, containLabel: true },
    tooltip: {
      trigger: "item",
      valueFormatter: (v: number | string) => (typeof v === "number" ? fmtAxis(v) : ""),
    },
    legend: { bottom: 0, textStyle: { fontSize: 10 } },
    xAxis: { type: "category", data: data.categories ?? [], axisLabel: { fontSize: 10 } },
    yAxis: { type: "value", axisLabel: { formatter: fmtAxis, fontSize: 10 } },
    series: seriesList.map((s, i) => ({
      name: s.name,
      type: "scatter",
      symbolSize: 8,
      itemStyle: { color: seriesColor(i) },
      data: s.points.map((p) => [p.category, p.value]),
    })),
  }

  return <ReactECharts option={option} style={{ height }} notMerge />
}
