"use client"

import ReactECharts from "echarts-for-react"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { seriesColor } from "@/lib/bi/color-tokens"

export default function BiStackedBarChart({ config, data, height = 360 }: ChartProps) {
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const fmtAxis = (v: number) => formatNumber(v, fmt, decimals)
  const categories = data.categories ?? []
  const seriesList = data.series ?? []

  const option = {
    grid: { left: "3%", right: "4%", top: 24, bottom: 60, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v: number | string) => (typeof v === "number" ? fmtAxis(v) : ""),
    },
    legend: { bottom: 0, textStyle: { fontSize: 10 } },
    xAxis: { type: "category", data: categories, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: "value", axisLabel: { formatter: fmtAxis, fontSize: 10 } },
    series: seriesList.map((s, i) => ({
      name: s.name,
      type: "bar",
      stack: "total",
      itemStyle: { color: seriesColor(i) },
      data: categories.map((c) => {
        const pt = s.points.find((p) => p.category === c)
        return pt ? pt.value : 0
      }),
    })),
  }

  return <ReactECharts option={option} style={{ height }} notMerge />
}
