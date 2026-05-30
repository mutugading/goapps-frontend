"use client"

// BI landing — Executive Dashboard with pinned cards + all-dashboards grid.
// Featured (pinned) cards display live KPI previews fetched from each dashboard's
// data endpoint so executives can see key metrics at a glance.

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink, Pin, PinOff, ArrowDown, ArrowUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import {
  useAccessibleDashboards,
  useFeaturedDashboards,
  usePinDashboard,
} from "@/hooks/bi/use-dashboard"
import { usePermission } from "@/lib/hooks/use-permission"
import { chartTypeToString, CHART_TYPE_LABELS } from "@/types/bi"
import { ViewerEmptyState } from "@/components/bi/viewer/states"
import { cn } from "@/lib/utils"
import type { Dashboard, KpiResult } from "@/types/bi"

// ── KPI preview fetcher ───────────────────────────────────────────────────────

function useDashboardKpis(dashboardCode: string) {
  const [kpis, setKpis] = useState<KpiResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const url = `/api/v1/finance/bi/dashboards/by-code/${dashboardCode}/data?period=L12M&compare=NONE`
    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { data?: { kpis?: KpiResult[] } }) => {
        setKpis(d.data?.kpis ?? [])
      })
      .catch(() => {
        setKpis([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [dashboardCode])

  return { kpis, loading }
}

// ── KPI chips row ─────────────────────────────────────────────────────────────

function KpiPreviewRow({ dashboardCode }: { dashboardCode: string }) {
  const { kpis, loading } = useDashboardKpis(dashboardCode)

  if (loading) {
    return (
      <div className="mt-2 flex gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
    )
  }
  if (kpis.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-3">
      {kpis.slice(0, 4).map((k, i) => (
        <div key={`${k.label}-${i}`} className="flex flex-col gap-0.5 rounded-md bg-muted/60 px-3 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {k.label}
          </span>
          <span className="text-sm font-bold tabular-nums leading-tight">{k.valueFormatted}</span>
          {k.comparePeriodLabel !== "" && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-[10px] leading-none",
                k.improving ? "text-emerald-600" : "text-red-500",
              )}
            >
              {k.improving ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
              {k.deltaPct >= 0 ? "+" : ""}
              {k.deltaPct.toFixed(1)}%
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

// ── FeaturedCard ──────────────────────────────────────────────────────────────

interface FeaturedCardProps {
  dashboard: Dashboard
  isAdmin: boolean
}

function FeaturedCard({ dashboard, isAdmin }: FeaturedCardProps) {
  const { mutate: togglePin, isPending } = usePinDashboard()

  return (
    <Link href={`/finance/bi/${dashboard.dashboardCode}`} className="block h-full">
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="truncate text-base">{dashboard.dashboardTitle}</CardTitle>
              {dashboard.description && (
                <CardDescription className="mt-0.5 line-clamp-2 text-xs">
                  {dashboard.description}
                </CardDescription>
              )}
            </div>
            {isAdmin && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={isPending}
                title="Unpin from Executive Dashboard"
                onClick={(e) => {
                  e.preventDefault()
                  togglePin({ id: dashboard.dashboardId, pin: false })
                }}
              >
                <PinOff className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Live KPI preview */}
          <KpiPreviewRow dashboardCode={dashboard.dashboardCode} />

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">
              {CHART_TYPE_LABELS[chartTypeToString(dashboard.chartType)] ?? "Chart"}
            </Badge>
            <span className="flex items-center gap-1">
              View full dashboard <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ── SmallCard ─────────────────────────────────────────────────────────────────

interface SmallCardProps {
  dashboard: Dashboard
  isAdmin: boolean
}

function SmallCard({ dashboard, isAdmin }: SmallCardProps) {
  const { mutate: togglePin, isPending } = usePinDashboard()

  return (
    <Link href={`/finance/bi/${dashboard.dashboardCode}`}>
      <Card className="group cursor-pointer transition-shadow hover:shadow-sm">
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-start justify-between gap-1">
            <CardTitle className="line-clamp-2 text-sm leading-snug">{dashboard.dashboardTitle}</CardTitle>
            {isAdmin && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={isPending}
                title="Pin to Executive Dashboard"
                onClick={(e) => {
                  e.preventDefault()
                  togglePin({ id: dashboard.dashboardId, pin: true })
                }}
              >
                <Pin className="h-3 w-3" />
              </Button>
            )}
          </div>
          {dashboard.groupName && (
            <Badge variant="secondary" className="mt-1 w-fit text-[10px]">
              {dashboard.groupName}
            </Badge>
          )}
        </CardHeader>
      </Card>
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <ViewerEmptyState message="Failed to load dashboards" />
      ) : (
        <>
          {/* Pinned / Featured section */}
          {featured.length > 0 && (
            <section>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Pinned
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((d) => (
                  <FeaturedCard key={d.dashboardId} dashboard={d} isAdmin={isAdmin} />
                ))}
              </div>
            </section>
          )}

          {/* All other dashboards */}
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

          {/* Empty state: no dashboards at all */}
          {featured.length === 0 && others.length === 0 && (
            <ViewerEmptyState message="No dashboards available for your role" />
          )}
        </>
      )}
    </div>
  )
}
