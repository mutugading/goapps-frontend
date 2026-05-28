"use client"

import ReactECharts from "echarts-for-react"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { seriesColor } from "@/lib/bi/color-tokens"

interface SeriesDef {
  name?: string
  type?: string
  field?: string
}

export default function BiMixedChart({ config, data, height = 360 }: ChartProps) {
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const fmtAxis = (v: number) => formatNumber(v, fmt, decimals)
  const categories = data.categories ?? []

  // Prefer explicit series_defs from config to assign bar vs line; otherwise infer
  // (first series = bar, rest = line).
  const defs = (config.series_defs as SeriesDef[] | undefined) ?? []
  const dataSeries = data.series ?? []

  const option = {
    grid: { left: "3%", right: "4%", top: 30, bottom: 60, containLabel: true },
    tooltip: {
      trigger: "axis",
      valueFormatter: (v: number | string) => (typeof v === "number" ? fmtAxis(v) : ""),
    },
    legend: { bottom: 0, textStyle: { fontSize: 10 } },
    xAxis: { type: "category", data: categories, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: "value", axisLabel: { formatter: fmtAxis, fontSize: 10 } },
    series: dataSeries.map((s, i) => {
      const def = defs[i]
      const kind = def?.type === "line" || (def === undefined && i > 0) ? "line" : "bar"
      return {
        name: s.name,
        type: kind,
        smooth: kind === "line",
        itemStyle: { color: seriesColor(i) },
        lineStyle: kind === "line" ? { width: 2 } : undefined,
        data: categories.map((c) => {
          const pt = s.points.find((p) => p.category === c)
          return pt ? pt.value : 0
        }),
      }
    }),
  }

  return <ReactECharts option={option} style={{ height }} notMerge />
}
