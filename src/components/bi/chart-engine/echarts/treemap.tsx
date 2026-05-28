"use client"

import ReactECharts from "echarts-for-react"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { primarySeries, cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"

export default function BiTreemapChart({ config, data, onDrill, height = 360 }: ChartProps) {
  const series = primarySeries(data)
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const currentPath = data.drillContext?.currentPath ?? []
  const canDrill = Boolean(data.drillContext?.canDrill) && Boolean(onDrill)

  const treeData = (series?.points ?? []).map((p) => ({ name: p.category, value: Math.abs(p.value) }))

  const option = {
    tooltip: {
      valueFormatter: (v: number | string) => (typeof v === "number" ? formatNumber(v, fmt, decimals) : ""),
    },
    series: [
      {
        type: "treemap",
        roam: false,
        nodeClick: false,
        label: { show: true, fontSize: 11 },
        breadcrumb: { show: false },
        data: treeData,
      },
    ],
  }

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      notMerge
      onEvents={
        canDrill
          ? { click: (p: { name?: string }) => p.name && onDrill?.([...currentPath, p.name]) }
          : undefined
      }
    />
  )
}
