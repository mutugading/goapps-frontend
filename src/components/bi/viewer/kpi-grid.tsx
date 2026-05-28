"use client"

// KPI grid — renders the KpiResult[] from a chart-data payload as responsive cards.

import { ArrowDown, ArrowUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { KpiResult } from "@/types/bi"
import { MiniSparkline } from "./mini-sparkline"

interface KpiGridProps {
  kpis: KpiResult[]
}

export function KpiGrid({ kpis }: KpiGridProps) {
  if (kpis.length === 0) return null
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k, i) => {
        const hasDelta = k.comparePeriodLabel !== ""
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
                    k.improving ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {k.improving ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {k.deltaPct >= 0 ? "+" : ""}
                  {k.deltaPct.toFixed(1)}% vs {k.comparePeriodLabel}
                </div>
              )}
              {k.sparkline && k.sparkline.length > 1 && (
                <MiniSparkline values={k.sparkline} />
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
