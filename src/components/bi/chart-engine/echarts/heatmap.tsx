"use client"

import ReactECharts from "echarts-for-react"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"

export default function BiHeatmapChart({ config, data, height = 360 }: ChartProps) {
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)

  // Each series → a row (y axis); each point category → a column (x axis).
  const seriesList = data.series ?? []
  const yLabels = seriesList.map((s) => s.name)
  const xLabels = data.categories ?? []

  const cells: [number, number, number][] = []
  let maxVal = 0
  seriesList.forEach((s, yi) => {
    s.points.forEach((p) => {
      const xi = xLabels.indexOf(p.category)
      if (xi < 0) return
      cells.push([xi, yi, p.value])
      maxVal = Math.max(maxVal, Math.abs(p.value))
    })
  })

  const option = {
    grid: { left: "3%", right: "6%", top: 24, bottom: 60, containLabel: true },
    tooltip: {
      position: "top",
      formatter: (params: { value: [number, number, number] }) =>
        `${xLabels[params.value[0]]} / ${yLabels[params.value[1]]}: ${formatNumber(params.value[2], fmt, decimals)}`,
    },
    xAxis: { type: "category", data: xLabels, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: "category", data: yLabels, axisLabel: { fontSize: 10 } },
    visualMap: {
      min: 0,
      max: maxVal || 1,
      calculable: true,
      orient: "vertical",
      right: 0,
      top: "center",
      inRange: { color: ["#e0f3f8", "#2E75B6", "#1F4E79"] },
    },
    series: [{ type: "heatmap", data: cells, label: { show: false } }],
  }

  return <ReactECharts option={option} style={{ height }} notMerge />
}
