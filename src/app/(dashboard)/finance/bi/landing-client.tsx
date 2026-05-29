"use client"

// BI landing — Executive Dashboard with pinned cards + all-dashboards grid.

import Link from "next/link"
import { ExternalLink, Pin, PinOff } from "lucide-react"

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
import type { Dashboard } from "@/types/bi"

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
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px]">
              {CHART_TYPE_LABELS[chartTypeToString(dashboard.chartType)] ?? "Chart"}
            </Badge>
            <span className="flex items-center gap-1">
              View <ExternalLink className="h-3 w-3" />
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
              <Skeleton key={i} className="h-28 w-full" />
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
