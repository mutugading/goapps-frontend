"use client"

import ReactECharts from "echarts-for-react"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { primarySeries, cfgStr, cfgNum, cfgBool } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { colorOr } from "@/lib/bi/color-tokens"

export default function BiWaterfallChart({ config, data, onDrill, height = 360 }: ChartProps) {
  const series = primarySeries(data)
  const points = series?.points ?? []
  const fmt = cfgStr(config, "number_format", "currency_thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const showTotal = cfgBool(config, "show_total_bar", true)
  const posColor = colorOr(config, "positive_color", "#1d9e75")
  const negColor = colorOr(config, "negative_color", "#a32d2d")
  const totalColor = colorOr(config, "total_color", "#534AB7")

  const categories: string[] = []
  const placeholders: number[] = []
  const positive: (number | "-")[] = []
  const negative: (number | "-")[] = []
  const totals: (number | "-")[] = []

  let cum = 0
  for (const p of points) {
    categories.push(p.category)
    if (p.value >= 0) {
      placeholders.push(cum)
      positive.push(p.value)
      negative.push("-")
    } else {
      placeholders.push(cum + p.value)
      positive.push("-")
      negative.push(-p.value)
    }
    totals.push("-")
    cum += p.value
  }

  if (showTotal) {
    categories.push("Total")
    placeholders.push(0)
    positive.push("-")
    negative.push("-")
    totals.push(cum)
  }

  const fmtAxis = (v: number) => formatNumber(v, fmt, decimals)
  const currentPath = data.drillContext?.currentPath ?? []
  const canDrill = Boolean(data.drillContext?.canDrill) && Boolean(onDrill)

  const option = {
    grid: { left: "3%", right: "4%", top: 24, bottom: 60, containLabel: true },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (v: number | string) => (typeof v === "number" ? fmtAxis(v) : ""),
    },
    xAxis: { type: "category", data: categories, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: "value", axisLabel: { formatter: fmtAxis, fontSize: 10 } },
    series: [
      { type: "bar", stack: "wf", itemStyle: { color: "transparent" }, emphasis: { itemStyle: { color: "transparent" } }, data: placeholders, silent: true },
      { name: "Increase", type: "bar", stack: "wf", itemStyle: { color: posColor }, data: positive },
      { name: "Decrease", type: "bar", stack: "wf", itemStyle: { color: negColor }, data: negative },
      {
        name: "Total",
        type: "bar",
        stack: "wf",
        itemStyle: { color: totalColor },
        data: totals,
        label: { show: true, position: "top", fontSize: 10, fontWeight: "bold", formatter: (p: { value: number | string }) => (typeof p.value === "number" ? fmtAxis(p.value) : "") },
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
          ? { click: (p: { name?: string }) => p.name && p.name !== "Total" && onDrill?.([...currentPath, p.name]) }
          : undefined
      }
    />
  )
}
