"use client"

import { useState } from "react"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { toRechartsRows, seriesNames, cfgStr, cfgNum, cfgBool } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { biColors, seriesColor } from "@/lib/bi/color-tokens"

export default function BiLineChart({ config, data, height = 360 }: ChartProps) {
  const rows = toRechartsRows(data)
  const names = seriesNames(data)
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const smooth = cfgBool(config, "smooth", true)
  const seriesColors = (config.series_colors ?? {}) as Record<string, string>

  // Track which series are hidden (click-to-toggle via legend).
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({})

  const handleLegendClick = (payload: { dataKey?: unknown }) => {
    const key = payload?.dataKey
    if (typeof key === "string") {
      setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }))
    }
  }

  // Show legend only when there are multiple series (single-series charts don't need it).
  const showLegend = names.length > 1

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={rows}
        margin={{ top: 16, right: 16, bottom: showLegend ? 40 : 24, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v, fmt, decimals)} />
        <Tooltip formatter={(v: number) => formatNumber(v, fmt, decimals)} />
        {showLegend && (
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="line"
            iconSize={16}
            wrapperStyle={{ fontSize: 11, cursor: "pointer" }}
            onClick={handleLegendClick}
          />
        )}
        {names.map((name, i) => {
          const color = seriesColors[name] ?? (i === 0 ? biColors.primary : seriesColor(i))
          return (
            <Line
              key={name}
              type={smooth ? "monotone" : "linear"}
              dataKey={name}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={i > 0 ? "4 4" : undefined}
              dot={false}
              hide={hiddenSeries[name] === true}
            />
          )
        })}
      </LineChart>
    </ResponsiveContainer>
  )
}
