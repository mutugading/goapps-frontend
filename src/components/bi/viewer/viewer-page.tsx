"use client"

// ViewerPage — composes the full executive-dashboard viewer for one dashboard code.

import { useRef } from "react"
import { RefreshCw } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import { useUrlState } from "@/lib/hooks"
import { usePermission } from "@/lib/hooks/use-permission"
import { useDashboardByCode } from "@/hooks/bi/use-dashboard"
import { useDashboardData } from "@/hooks/bi/use-chart-data"
import { chartTypeToString, periodeGrainToString, type ViewerState, DEFAULT_VIEWER_STATE, type CompareKey } from "@/types/bi"
import { isEmpty } from "@/lib/bi/data-adapter"

import { ChartEngine } from "@/components/bi/chart-engine/chart-engine"
import { ExportPngButton } from "@/components/bi/chart-engine/export-png-button"
import { FullscreenButton } from "@/components/bi/chart-engine/fullscreen-button"
import { FilterBar } from "./filter-bar"
import { KpiGrid } from "./kpi-grid"
import { DrillBreadcrumb } from "./drill-breadcrumb"
import { SecondaryGrid } from "./secondary-grid"
import { ViewerEmptyState, ViewerErrorState, DataFreshnessBadge } from "./states"

export function ViewerPage({ code }: { code: string }) {
  const chartCardRef = useRef<HTMLDivElement>(null)
  const { hasPermission } = usePermission()

  const [state, setState] = useUrlState<ViewerState>({ defaultValues: DEFAULT_VIEWER_STATE })

  const { data: dashboard, isLoading: dashLoading, isError: dashError } = useDashboardByCode(code)

  const refreshMs = dashboard
    ? (dashboard.refreshIntervalSec || dashboard.cacheTtlSec || 0) * 1000
    : 0

  const {
    data: chartData,
    isLoading: dataLoading,
    isError: dataError,
    error,
    refetch,
  } = useDashboardData(code, state, refreshMs)

  if (dashLoading) return <ViewerSkeleton />
  if (dashError || !dashboard) return <ViewerErrorState message="Dashboard not found" />

  const compareModes = (dashboard.compareModes ?? []).map(compareEnumToKey).filter(Boolean) as CompareKey[]
  const chartType = chartTypeToString(dashboard.chartType)

  return (
    <div className="space-y-6">
      <PageHeader title={dashboard.dashboardTitle} subtitle={dashboard.description}>
        <DataFreshnessBadge timestamp={chartData?.meta?.asOf} />
      </PageHeader>

      <FilterBar state={state} onChange={setState} compareModes={compareModes} />

      {chartData && <KpiGrid kpis={chartData.kpis ?? []} />}

      <Card ref={chartCardRef}>
        <CardContent className="space-y-4 pt-6">
          <DrillBreadcrumb
            rootLabel={dashboard.dashboardTitle}
            path={state.drillPath}
            onJump={(newPath) => setState({ ...state, drillPath: newPath })}
          />

          {dataLoading ? (
            <Skeleton className="h-[360px] w-full rounded-md" />
          ) : dataError ? (
            <ViewerErrorState message={error?.message} onRetry={() => void refetch()} />
          ) : isEmpty(chartData) ? (
            <ViewerEmptyState showUploadCta={hasPermission("finance.bi.upload.create")} />
          ) : (
            chartData && (
              <ChartEngine
                chartType={chartType}
                config={(chartData.config ?? dashboard.chartConfig ?? {}) as Record<string, unknown>}
                data={chartData}
                onDrill={(nextPath) => setState({ ...state, drillPath: nextPath })}
              />
            )
          )}
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <ExportPngButton targetRef={chartCardRef} fileName={`${dashboard.dashboardCode}_${state.period}`} />
          <FullscreenButton targetRef={chartCardRef} />
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </CardFooter>
      </Card>

      {chartData && dashboard.layoutConfig && (
        <SecondaryGrid layoutConfig={dashboard.layoutConfig as Record<string, unknown>} data={chartData} />
      )}
    </div>
  )
}

/** Maps the proto CompareMode enum value to the FE CompareKey string. */
function compareEnumToKey(mode: number): CompareKey | "" {
  switch (mode) {
    case 1: return "NONE"
    case 2: return "MoM"
    case 3: return "QoQ"
    case 4: return "YoY"
    case 5: return "YTD"
    case 6: return "R12"
    default: return ""
  }
}

function ViewerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-[420px] w-full" />
    </div>
  )
}

// periodeGrainToString re-exported indirectly to keep imports stable for future use.
export { periodeGrainToString }
