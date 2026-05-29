"use client"

// ViewerPage — composes the full executive-dashboard viewer for one dashboard code.

import { useRef, useCallback } from "react"
import { RefreshCw } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import { useUrlState } from "@/lib/hooks"
import { usePermission } from "@/lib/hooks/use-permission"
import { useDashboardByCode } from "@/hooks/bi/use-dashboard"
import { useDashboardData } from "@/hooks/bi/use-chart-data"
import { useFactDistincts } from "@/hooks/bi/use-fact-distincts"
import { chartTypeToString, periodeGrainToString, type ViewerState, DEFAULT_VIEWER_STATE, type CompareKey } from "@/types/bi"
import { isEmpty } from "@/lib/bi/data-adapter"

import { ChartEngine } from "@/components/bi/chart-engine/chart-engine"
import { ExportPngButton } from "@/components/bi/chart-engine/export-png-button"
import { FullscreenButton } from "@/components/bi/chart-engine/fullscreen-button"
import { FilterBar } from "./filter-bar"
import { FilterChips } from "./filter-chips"
import { KpiGrid } from "./kpi-grid"
import { DrillBreadcrumb } from "./drill-breadcrumb"
import { SecondaryGrid } from "./secondary-grid"
import { ViewerEmptyState, ViewerErrorState, DataFreshnessBadge } from "./states"

export function ViewerPage({ code }: { code: string }) {
  const chartCardRef = useRef<HTMLDivElement>(null)
  const { hasPermission } = usePermission()

  const [state, setState] = useUrlState<ViewerState>({
    defaultValues: DEFAULT_VIEWER_STATE,
    serialize: (key, value) => {
      // Suppress empty arrays so they don't pollute the URL.
      if (Array.isArray(value)) return value.length > 0 ? JSON.stringify(value) : undefined
      if (value === undefined || value === null || value === "") return undefined
      if (typeof value === "string") return value || undefined
      return JSON.stringify(value)
    },
  })

  const { data: dashboard, isLoading: dashLoading, isError: dashError } = useDashboardByCode(code)

  // Load distinct group values when the dashboard has filter_chips configured
  const filterChipFields = (dashboard?.chartConfig?.["filter_chips"] as string[] | undefined) ?? []
  const hasFilterChips = filterChipFields.length > 0
  const { data: distincts } = useFactDistincts(hasFilterChips ? (dashboard?.filterType ?? "") : "")

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

  // Toggle helpers — mutate URL state so the data query refetches automatically.
  const toggleGroup1 = useCallback((v: string) => {
    setState((prev) => {
      const current = prev.group1Filter ?? []
      return {
        ...prev,
        group1Filter: current.includes(v) ? current.filter((x) => x !== v) : [...current, v],
      }
    })
  }, [setState])

  const toggleGroup2 = useCallback((v: string) => {
    setState((prev) => {
      const current = prev.group2Filter ?? []
      return {
        ...prev,
        group2Filter: current.includes(v) ? current.filter((x) => x !== v) : [...current, v],
      }
    })
  }, [setState])

  if (dashLoading) return <ViewerSkeleton />
  if (dashError || !dashboard) return <ViewerErrorState message="Dashboard not found" />

  const compareModes = (dashboard.compareModes ?? []).map(compareEnumToKey).filter(Boolean) as CompareKey[]
  const primaryChartType = chartTypeToString(dashboard.chartType)
  const availableChartTypes = (dashboard.chartConfig?.["available_chart_types"] as string[] | undefined) ?? []
  // Use the viewer-selected chart type if set, otherwise fall back to the dashboard primary.
  const chartType = state.chartType || primaryChartType

  const group1Values = distincts?.group1s ?? []
  const group2Values = distincts?.group2s ?? []
  const group1Filter = state.group1Filter ?? []
  const group2Filter = state.group2Filter ?? []

  // Categories from chart data — used to drive the month selector in FilterBar.
  const categories = chartData?.categories ?? []

  // Effective selected period: use URL state if set, otherwise default to latest available.
  const effectiveSelectedPeriod = state.selectedPeriod ?? categories[categories.length - 1]

  return (
    <div className="space-y-6">
      <PageHeader title={dashboard.dashboardTitle} subtitle={dashboard.description}>
        <DataFreshnessBadge timestamp={chartData?.meta?.asOf} />
      </PageHeader>

      <FilterBar
        state={state}
        onChange={setState}
        compareModes={compareModes}
        primaryChartType={primaryChartType}
        availableChartTypes={availableChartTypes}
        categories={categories}
      />

      {hasFilterChips && (group1Values.length > 0 || group2Values.length > 0) && (
        <div className="flex flex-col gap-2 rounded-lg border bg-card px-4 py-3">
          {filterChipFields.includes("group_1") && group1Values.length > 0 && (
            <FilterChips
              label="Delivery Type"
              values={group1Values}
              selected={group1Filter}
              onToggle={toggleGroup1}
              onSelectAll={() => setState({ ...state, group1Filter: [] })}
            />
          )}
          {filterChipFields.includes("group_2") && group2Values.length > 0 && (
            <FilterChips
              label="Category"
              values={group2Values}
              selected={group2Filter}
              onToggle={toggleGroup2}
              onSelectAll={() => setState({ ...state, group2Filter: [] })}
            />
          )}
        </div>
      )}

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
        <SecondaryGrid
          layoutConfig={dashboard.layoutConfig as Record<string, unknown>}
          data={chartData}
          dashboardCode={code}
          selectedPeriod={effectiveSelectedPeriod}
        />
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
