"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import type { ChartProps } from "@/components/bi/chart-engine/types"
import { toRechartsRows, seriesNames, cfgStr, cfgNum, type RechartsRow } from "@/lib/bi/data-adapter"
import { formatNumber, type NumberFormat } from "@/lib/bi/number-format"
import { biColors, seriesColor } from "@/lib/bi/color-tokens"

// Rich tooltip shown when rows carry __denom_val / __numer_val meta fields
// (populated by ComputedRatioCard for ratio charts like Margin % by Category).
function RichTooltip({
  active,
  payload,
  fmt,
  decimals,
  denomLabel,
  numerLabel,
}: {
  active?: boolean
  payload?: { payload: RechartsRow; value: number; name: string }[]
  fmt: NumberFormat
  decimals: number
  denomLabel: string
  numerLabel: string
}) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  const ratio = payload[0].value as number
  const denomVal = (row["__denom_val"] as number | undefined) ?? 0
  const numerVal = (row["__numer_val"] as number | undefined) ?? 0
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md space-y-1">
      <p className="font-semibold text-sm">{row.category}</p>
      <p className="text-muted-foreground">
        {denomLabel}: <span className="text-foreground font-medium">{formatNumber(denomVal, fmt, decimals)}</span>
      </p>
      <p className="text-muted-foreground">
        {numerLabel}: <span className="text-foreground font-medium">{formatNumber(numerVal, fmt, decimals)}</span>
      </p>
      <p className="text-muted-foreground">
        Margin %:{" "}
        <span className="font-semibold" style={{ color: ratio >= 0 ? "#1d9e75" : "#a32d2d" }}>
          {ratio.toFixed(1)}%
        </span>
      </p>
    </div>
  )
}

export default function BiHorizontalBarChart({ config, data, onDrill, height = 360 }: ChartProps) {
  const rows = toRechartsRows(data)
  const names = seriesNames(data)
  const fmt = cfgStr(config, "number_format", "thousands") as NumberFormat
  const decimals = cfgNum(config, "decimals", 1)
  const currentPath = data.drillContext?.currentPath ?? []
  const canDrill = Boolean(data.drillContext?.canDrill) && Boolean(onDrill)

  // Detect rich meta: rows have __denom_val injected by ComputedRatioCard.
  const hasRichMeta = rows.length > 0 && "__denom_val" in rows[0]
  const denomLabel = cfgStr(config, "tooltip_denom_label", "Net Sales")
  const numerLabel = cfgStr(config, "tooltip_numer_label", "Margin")

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart layout="vertical" data={rows} margin={{ top: 16, right: 24, bottom: 8, left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => formatNumber(v, fmt, decimals)} />
        <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={120} />
        {hasRichMeta ? (
          <Tooltip
            content={
              <RichTooltip
                fmt={fmt}
                decimals={decimals}
                denomLabel={denomLabel}
                numerLabel={numerLabel}
              />
            }
          />
        ) : (
          <Tooltip formatter={(v: number) => formatNumber(v, fmt, decimals)} />
        )}
        {names.map((name, i) => (
          <Bar
            key={name}
            dataKey={name}
            fill={i === 0 ? biColors.primary : seriesColor(i)}
            radius={[0, 3, 3, 0]}
            cursor={canDrill ? "pointer" : undefined}
            onClick={
              canDrill
                ? (entry: { category?: string }) => entry.category && onDrill?.([...currentPath, entry.category])
                : undefined
            }
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
