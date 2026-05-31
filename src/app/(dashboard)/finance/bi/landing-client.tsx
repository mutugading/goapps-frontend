"use client"

// BI landing — Executive Dashboard with per-dashboard chart sections.
// Featured (pinned) dashboards each get a section showing an embedded chart.
// Non-featured dashboards appear in a compact directory grid below.

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink, Pin, PinOff } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import { cn } from "@/lib/utils"
import {
  useAccessibleDashboards,
  useFeaturedDashboards,
  usePinDashboard,
} from "@/hooks/bi/use-dashboard"
import { usePermission } from "@/lib/hooks/use-permission"
import { chartTypeToString } from "@/types/bi"
import { ChartEngine } from "@/components/bi/chart-engine/chart-engine"
import { ViewerEmptyState } from "@/components/bi/viewer/states"
import type { Dashboard, ChartDataResponse } from "@/types/bi"

// ── Types ─────────────────────────────────────────────────────────────────────

interface LandingSection {
  chart_id: string
  title: string
  show: boolean
}

// ── Chart data fetcher ────────────────────────────────────────────────────────

// sentinel value distinguishes "not yet fetched" (undefined) from "fetched but empty" (null)
const LOADING_SENTINEL = undefined

function useDashboardChartData(dashboardCode: string) {
  const [chartData, setChartData] = useState<ChartDataResponse | null | typeof LOADING_SENTINEL>(LOADING_SENTINEL)

  useEffect(() => {
    let cancelled = false
    const url = `/api/v1/finance/bi/dashboards/by-code/${dashboardCode}/data?period_preset=L12M&compare=NONE`
    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { data?: ChartDataResponse }) => {
        if (!cancelled) setChartData(d.data ?? null)
      })
      .catch(() => {
        if (!cancelled) setChartData(null)
      })
    return () => { cancelled = true }
  }, [dashboardCode])

  return { chartData: chartData ?? null, loading: chartData === LOADING_SENTINEL }
}

// ── DashboardSection ──────────────────────────────────────────────────────────

interface DashboardSectionProps {
  dashboard: Dashboard
  isAdmin: boolean
}

function DashboardSection({ dashboard, isAdmin }: DashboardSectionProps) {
  const { mutate: togglePin, isPending } = usePinDashboard()
  const { chartData, loading } = useDashboardChartData(dashboard.dashboardCode)

  // Read landing_sections from layout_config; default to showing the main chart.
  const rawSections = (dashboard.layoutConfig as Record<string, unknown> | undefined)?.landing_sections
  const landingSections: LandingSection[] = Array.isArray(rawSections)
    ? (rawSections as LandingSection[])
    : [{ chart_id: "main", title: dashboard.dashboardTitle, show: true }]
  const showMain = landingSections.find((s) => s.chart_id === "main")?.show !== false
  const sectionTitle =
    landingSections.find((s) => s.chart_id === "main")?.title || dashboard.dashboardTitle

  const chartType = chartTypeToString(dashboard.chartType)
  const chartConfig = (chartData?.config ?? dashboard.chartConfig ?? {}) as Record<string, unknown>

  return (
    <section className="flex flex-col gap-3">
      {/* Section header */}
      <div className="flex flex-wrap items-start justify-between gap-2 sm:flex-nowrap sm:items-center">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{sectionTitle}</h2>
          {dashboard.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{dashboard.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              disabled={isPending}
              title="Unpin from Executive Dashboard"
              onClick={() => togglePin({ id: dashboard.dashboardId, pin: false })}
            >
              <PinOff className="mr-1 h-3 w-3" />
              Unpin
            </Button>
          )}
          <Link href={`/finance/bi/${dashboard.dashboardCode}`}>
            <Button size="sm" variant="ghost" className="h-7 text-xs">
              View Full
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Chart */}
      {showMain && (
        <div className="rounded-xl border bg-card p-4 shadow-sm md:p-5">
          {loading ? (
            <div className="flex h-[320px] items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : chartData ? (
            <ChartEngine
              chartType={chartType}
              config={chartConfig}
              data={chartData}
              height={320}
            />
          ) : (
            <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
              No data available
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ── SmallCard (non-featured dashboards) ──────────────────────────────────────

interface SmallCardProps {
  dashboard: Dashboard
  isAdmin: boolean
}

function SmallCard({ dashboard, isAdmin }: SmallCardProps) {
  const { mutate: togglePin, isPending } = usePinDashboard()

  return (
    <Link href={`/finance/bi/${dashboard.dashboardCode}`}>
      <div className="group cursor-pointer rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm">
        <div className="flex items-start justify-between gap-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug">{dashboard.dashboardTitle}</p>
          {isAdmin && (
            <button
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              disabled={isPending}
              title="Pin to Executive Dashboard"
              onClick={(e) => {
                e.preventDefault()
                togglePin({ id: dashboard.dashboardId, pin: true })
              }}
            >
              <Pin className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        {dashboard.groupName && (
          <Badge variant="outline" className="mt-2 text-[10px]">
            {dashboard.groupName}
          </Badge>
        )}
      </div>
    </Link>
  )
}

// ── BiLandingClient ───────────────────────────────────────────────────────────

export default function BiLandingClient() {
  const { hasPermission } = usePermission()
  const isAdmin = hasPermission("finance.bi.dashboard.update")

  const { data: featured = [], isLoading: featuredLoading } = useFeaturedDashboards()
  const { data: all, isLoading: allLoading, isError } = useAccessibleDashboards()

  const featuredIds = new Set(featured.map((d) => d.dashboardId))
  const others = (all ?? []).filter((d) => !featuredIds.has(d.dashboardId))

  const isLoading = featuredLoading || allLoading

  return (
    <div className="space-y-8">
      <PageHeader title="Executive Dashboard" subtitle="Key performance indicators and business metrics" />

      {isLoading ? (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-[320px] w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ViewerEmptyState message="Failed to load dashboards" />
      ) : (
        <>
          {/* Featured dashboard sections — one full chart section per pinned dashboard */}
          {featured.length > 0 && (
            <div className={cn(
              "gap-6",
              featured.length === 1 ? "flex flex-col" : "grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3"
            )}>
              {featured.map((d) => (
                <DashboardSection key={d.dashboardId} dashboard={d} isAdmin={isAdmin} />
              ))}
            </div>
          )}

          {/* Directory of all other accessible dashboards */}
          {others.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                All Dashboards
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {others.map((d) => (
                  <SmallCard key={d.dashboardId} dashboard={d} isAdmin={isAdmin} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {featured.length === 0 && others.length === 0 && (
            <ViewerEmptyState message="No dashboards available for your role" />
          )}
        </>
      )}
    </div>
  )
}
