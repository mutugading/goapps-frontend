"use client"

// BI landing — grid of dashboards the user can access, grouped by dashboard group.

import Link from "next/link"
import { BarChart3 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import { useAccessibleDashboards } from "@/hooks/bi/use-dashboard"
import { CHART_TYPE_LABELS, chartTypeToString } from "@/types/bi"
import { ViewerEmptyState } from "@/components/bi/viewer/states"

export default function BiLandingClient() {
  const { data: dashboards, isLoading, isError } = useAccessibleDashboards()

  return (
    <div className="space-y-6">
      <PageHeader title="Executive Dashboards" subtitle="Select a dashboard to explore" />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ViewerEmptyState message="Failed to load dashboards" />
      ) : !dashboards || dashboards.length === 0 ? (
        <ViewerEmptyState message="No dashboards available for your role" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboards.map((d) => (
            <Link key={d.dashboardId} href={`/finance/bi/${d.dashboardCode}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      {d.dashboardTitle}
                    </CardTitle>
                    {d.groupName && <Badge variant="secondary">{d.groupName}</Badge>}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {d.description || "—"}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {CHART_TYPE_LABELS[chartTypeToString(d.chartType)] ?? "Chart"}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
