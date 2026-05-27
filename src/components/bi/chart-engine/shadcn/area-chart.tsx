"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { toRechartsRows, seriesNames, cfgStr, cfgNum, cfgBool } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { biColors, seriesColor } from "@/lib/bi/color-tokens"

export default function BiAreaChart({ config, data, height = 360 }: ChartProps) {
  const rows = toRechartsRows(data)
  const names = seriesNames(data)
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const smooth = cfgBool(config, "smooth", true)
  const opacity = cfgNum(config, "opacity", 0.3)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={rows} margin={{ top: 16, right: 16, bottom: 24, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v, fmt, decimals)} />
        <Tooltip formatter={(v: number) => formatNumber(v, fmt, decimals)} />
        {names.map((name, i) => {
          const color = i === 0 ? biColors.primary : seriesColor(i)
          return (
            <Area
              key={name}
              type={smooth ? "monotone" : "linear"}
              dataKey={name}
              stroke={color}
              fill={color}
              fillOpacity={opacity}
              strokeWidth={2}
            />
          )
        })}
      </AreaChart>
    </ResponsiveContainer>
  )
}
