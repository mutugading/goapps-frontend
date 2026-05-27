"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { toRechartsRows, seriesNames, cfgStr, cfgNum } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { biColors, seriesColor } from "@/lib/bi/color-tokens"

export default function BiBarChart({ config, data, onDrill, height = 360 }: ChartProps) {
  const rows = toRechartsRows(data)
  const names = seriesNames(data)
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const currentPath = data.drillContext?.currentPath ?? []
  const canDrill = Boolean(data.drillContext?.canDrill) && Boolean(onDrill)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={{ top: 16, right: 16, bottom: 24, left: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v, fmt, decimals)} />
        <Tooltip formatter={(v: number) => formatNumber(v, fmt, decimals)} />
        {names.map((name, i) => (
          <Bar
            key={name}
            dataKey={name}
            fill={i === 0 ? biColors.primary : seriesColor(i)}
            radius={[3, 3, 0, 0]}
            cursor={canDrill ? "pointer" : undefined}
            onClick={
              canDrill
                ? (entry: { category?: string }) => entry.category && onDrill?.([...currentPath, entry.category])
                : undefined
            }
          >
            {i === 0 &&
              rows.map((r, ri) => (
                <Cell key={ri} fill={(r[name] as number) < 0 ? biColors.negative : biColors.primary} />
              ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
