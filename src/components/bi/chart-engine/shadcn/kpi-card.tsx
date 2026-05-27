"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"
import { ArrowDown, ArrowUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ChartProps } from "@/components/bi/chart-engine/types"
import { biColors } from "@/lib/bi/color-tokens"

export default function BiKpiCard({ data, height = 360 }: ChartProps) {
  const kpis = data.kpis ?? []
  if (kpis.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No KPIs configured
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k, i) => {
        const improving = k.improving
        const hasDelta = k.comparePeriodLabel !== ""
        const spark = k.sparkline ?? []
        return (
          <Card key={`${k.label}-${i}`}>
            <CardContent className="p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {k.label}
              </div>
              <div className="mt-1 text-2xl font-bold tabular-nums">{k.valueFormatted}</div>
              {hasDelta && (
                <div
                  className={cn(
                    "mt-1 flex items-center gap-1 text-xs",
                    improving ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {improving ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {k.deltaPct >= 0 ? "+" : ""}
                  {k.deltaPct.toFixed(1)}% vs {k.comparePeriodLabel}
                </div>
              )}
              {spark.length > 1 && (
                <div className="mt-2 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spark.map((v, idx) => ({ idx, v }))}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={biColors.positive}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
