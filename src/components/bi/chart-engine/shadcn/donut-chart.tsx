"use client"

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { primarySeries, cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { seriesColor } from "@/lib/bi/color-tokens"

export default function BiDonutChart({ config, data, onDrill, height = 360 }: ChartProps) {
  const series = primarySeries(data)
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const innerRadius = cfgNum(config, "inner_radius", 0.4)
  const currentPath = data.drillContext?.currentPath ?? []
  const canDrill = Boolean(data.drillContext?.canDrill) && Boolean(onDrill)

  // Donut uses absolute values; negative accounting figures become magnitudes.
  const pieData = (series?.points ?? []).map((p) => ({ name: p.category, value: Math.abs(p.value) }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          innerRadius={`${Math.round(innerRadius * 100)}%`}
          outerRadius="80%"
          cursor={canDrill ? "pointer" : undefined}
          onClick={
            canDrill
              ? (entry: { name?: string }) => entry.name && onDrill?.([...currentPath, entry.name])
              : undefined
          }
        >
          {pieData.map((_, i) => (
            <Cell key={i} fill={seriesColor(i)} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => formatNumber(v, fmt, decimals)} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
