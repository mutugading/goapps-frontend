"use client"

// ChartEngine — table-driven chart renderer. Routes by chart_type to a registry
// component. Code-splits ECharts via lazy registry imports. Wraps each chart in an
// error boundary so one failing chart never crashes the dashboard.

import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/shared/error-boundary/error-boundary"
import { getChartRegistration } from "@/lib/bi/chart-registry"
import type { ChartProps } from "./types"

export interface ChartEngineProps extends ChartProps {
  chartType: string
}

export function ChartEngine({ chartType, config, data, onDrill, height = 360 }: ChartEngineProps) {
  const reg = getChartRegistration(chartType)

  if (!reg) {
    return <ChartFallback message={`Unknown chart type: ${chartType}`} height={height} />
  }

  const Component = reg.Component
  return (
    <ErrorBoundary fallback={<ChartFallback message="Chart failed to render" height={height} />}>
      <Suspense fallback={<Skeleton className="w-full rounded-md" style={{ height }} />}>
        <Component config={config} data={data} onDrill={onDrill} height={height} />
      </Suspense>
    </ErrorBoundary>
  )
}

/** Minimal inline fallback for unknown types / render errors. */
function ChartFallback({ message, height }: { message: string; height: number }) {
  return (
    <div
      className="flex w-full items-center justify-center rounded-md border border-dashed border-muted-foreground/30 text-sm text-muted-foreground"
      style={{ height }}
    >
      {message}
    </div>
  )
}
