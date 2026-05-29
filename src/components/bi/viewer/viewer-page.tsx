"use client"

// ViewerPage — composes the full executive-dashboard viewer for one dashboard code.

import { useRef, useCallback } from "react"
import { RefreshCw } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import { useUrlState } from "@/lib/hooks"
import { usePermission } from "@/lib/hooks/use-permission"
import { useDashboardByCode } from "@/hooks/bi/use-dashboard"
import { useDashboardData } from "@/hooks/bi/use-chart-data"
import { useFactDistincts } from "@/hooks/bi/use-fact-distincts"
import { chartTypeToString, periodeGrainToString, type ViewerState, DEFAULT_VIEWER_STATE, type CompareKey, type ViewModeConfig } from "@/types/bi"
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
  // Use the viewer-selected chart type if set, otherwise fall back to the dashboard primary.
  const chartType = state.chartType || primaryChartType

  const group1Values = distincts?.group1s ?? []
  const group2Values = distincts?.group2s ?? []
  const group1Filter = state.group1Filter ?? []
  const group2Filter = state.group2Filter ?? []

  // Categories from chart data — used to drive the month selector in FilterBar.
  const categories = chartData?.categories ?? []

  // Effective selected period: use URL state only when it's a valid YYYYMM string.
  // Ignore stale non-period values (e.g. group_2 names from a previous navigation).
  const periodCategories = categories.filter(c => /^\d{6}$/.test(c))
  const validSelectedPeriod = /^\d{6}$/.test(state.selectedPeriod ?? "") ? state.selectedPeriod : undefined
  const effectiveSelectedPeriod = validSelectedPeriod ?? periodCategories[periodCategories.length - 1]

  // Read view_configs from the chart data response config (data endpoint returns the full JSONB config).
  // The dashboard config endpoint often omits chartConfig when the Struct is complex;
  // the data endpoint always returns the full config so we prefer it.
  const dataConfig = chartData?.config as Record<string, unknown> | undefined
  const dashConfig = dashboard.chartConfig as Record<string, unknown> | undefined

  // available_chart_types: prefer data endpoint config (always has full JSONB).
  const availableChartTypes = (
    (dataConfig?.availableChartTypes ?? dataConfig?.available_chart_types ??
     dashConfig?.availableChartTypes ?? dashConfig?.available_chart_types ?? []) as string[]
  )
  const rawViewConfigs = dataConfig ?? dashConfig
  const viewConfigsMap = (
    (rawViewConfigs?.viewConfigs ?? rawViewConfigs?.view_configs ?? {}) as Record<string, ViewModeConfig>
  )

  // Active view config for the currently displayed chart type.
  // The nested ViewModeConfig objects in view_configs JSONB use snake_case keys
  // (title_template, drill_enabled) — not converted by ts-proto. Normalise both.
  const rawVc = viewConfigsMap[chartType] as unknown as Record<string, unknown> | undefined
  const activeViewConfig: ViewModeConfig = rawVc
    ? {
        titleTemplate: (rawVc.titleTemplate ?? rawVc.title_template ?? dashboard.dashboardTitle ?? "") as string,
        drillEnabled: (rawVc.drillEnabled ?? rawVc.drill_enabled ?? !["line","area","multi_line","scatter","heatmap","kpi_card","data_table"].includes(chartType)) as boolean,
        hint: (rawVc.hint ?? undefined) as string | undefined,
      }
    : {
        titleTemplate: dashboard.dashboardTitle ?? "",
        drillEnabled: !["line","area","multi_line","scatter","heatmap","kpi_card","data_table"].includes(chartType),
        hint: undefined,
      }

  // Resolve chart card title — replace {period} with human-readable month label.
  function formatPeriodLabel(yyyymm: string): string {
    if (!yyyymm || yyyymm.length !== 6) return yyyymm ?? ""
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    const m = parseInt(yyyymm.slice(4, 6), 10)
    return `${months[m - 1] ?? ""} ${yyyymm.slice(0, 4)}`
  }

  const chartTitle = (activeViewConfig.titleTemplate
    ? activeViewConfig.titleTemplate.replace("{period}", formatPeriodLabel(effectiveSelectedPeriod ?? "")).trim()
    : "") || (dashboard.dashboardTitle ?? "")

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

      <KpiGrid kpis={chartData?.kpis ?? []} />

      <Card ref={chartCardRef}>
        <CardHeader className="pb-2">
          <div>
            <h3 className="text-base font-semibold leading-tight">{chartTitle}</h3>
            {activeViewConfig.hint && (
              <p className="mt-0.5 text-xs text-muted-foreground">{activeViewConfig.hint}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <DrillBreadcrumb
            rootLabel={dashboard.dashboardTitle}
            path={state.drillPath}
            onJump={(newPath) => setState({ ...state, drillPath: newPath })}
          />

          {dataError ? (
            <ViewerErrorState message={error?.message} onRetry={() => void refetch()} />
          ) : isEmpty(chartData) && !dataLoading ? (
            <ViewerEmptyState showUploadCta={hasPermission("finance.bi.upload.create")} />
          ) : chartData ? (
            <ChartEngine
              chartType={chartType}
              config={(chartData.config ?? dashboard.chartConfig ?? {}) as Record<string, unknown>}
              data={chartData}
              onDrill={activeViewConfig.drillEnabled ? (nextPath) => setState({ ...state, drillPath: nextPath }) : undefined}
            />
          ) : (
            <Skeleton className="h-[360px] w-full rounded-md" />
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
          drillEnabled={activeViewConfig.drillEnabled}
          canDrillDeeper={
            activeViewConfig.drillEnabled &&
            (state.drillPath?.length ?? 0) < ((dashboard.maxDrillLevel ?? 3) - (dashboard.filterGroup1 ? 1 : 0))
          }
          onDrill={(nextPath) => setState({ ...state, drillPath: nextPath })}
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
