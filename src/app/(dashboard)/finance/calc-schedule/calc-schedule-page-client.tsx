"use client"

import { useState } from "react"
import Link from "next/link"
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Layers,
  Play,
  Settings2,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/common/page-header"
import { KpiCard, KpiGrid } from "@/components/common"
import { StatusBadge } from "@/components/common/status-badge"
import { NewJobDialog } from "@/components/finance/calc-jobs/new-job-dialog"
import { useCalcJobs } from "@/hooks/finance/use-cost-calc"

// Human-readable cron expression — reflects orchestrator config.yaml `cron_schedule`.
// Update this label if the orchestrator cron_schedule is changed.
const CRON_LABEL = "Every 5th of month, 02:00 WIB"
const CRON_EXPR = "0 0 2 5 * * (Asia/Jakarta)"
const CRON_PERIOD = "Previous month (YYYYMM−1)"
const CRON_CALC_TYPE = "ACTUAL"

function fmtDatetime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function fmtDuration(ms: number): string {
  if (!ms) return "—"
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function CalcSchedulePageClient() {
  const [newJobOpen, setNewJobOpen] = useState(false)

  // Load recent jobs — show all scopes so manual ALL triggers are visible too.
  const { data, isLoading } = useCalcJobs({ page: 1, pageSize: 20 })
  const jobs = data?.items ?? []

  const allScopeJobs = jobs.filter((j) => j.scope === "ALL" || j.scope === "FILTERED")

  const kpis = {
    total: allScopeJobs.length,
    success: allScopeJobs.filter((j) => j.status === "SUCCESS").length,
    failed: allScopeJobs.filter(
      (j) => j.status === "FAILED" || j.status === "PARTIAL_FAILED",
    ).length,
    running: allScopeJobs.filter(
      (j) => j.status === "QUEUED" || j.status === "PLANNING" || j.status === "PROCESSING",
    ).length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calc schedule"
        subtitle="Periodic cost calculation for all products"
      >
        <Button onClick={() => setNewJobOpen(true)}>
          <Play className="mr-2 h-4 w-4" />
          Run now
        </Button>
      </PageHeader>

      {/* Auto-trigger schedule info */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <CalendarClock className="h-5 w-5 text-muted-foreground shrink-0" />
          <CardTitle className="text-sm font-semibold">Automatic schedule</CardTitle>
          <Badge variant="secondary" className="ml-auto text-xs">
            <Settings2 className="mr-1 h-3 w-3" />
            Config-driven
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Runs</p>
              <p className="font-medium">{CRON_LABEL}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Cron expression</p>
              <p className="font-mono text-xs">{CRON_EXPR}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Period calculated</p>
              <p className="font-medium">{CRON_PERIOD}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Calculation type</p>
              <p className="font-medium">{CRON_CALC_TYPE}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            To change the schedule, update{" "}
            <span className="font-mono">orchestrator.cron_schedule</span> in{" "}
            <span className="font-mono">finance-cost-orchestrator/config.yaml</span> and restart
            the orchestrator service. The expression uses 6-field cron format{" "}
            <span className="font-mono">(sec min hour day month dow)</span>.
          </p>
        </CardContent>
      </Card>

      {/* KPI strip */}
      <KpiGrid cols={4}>
        <KpiCard
          title="ALL/FILTERED jobs (last 20)"
          value={kpis.total}
          icon={Layers}
          loading={isLoading}
        />
        <KpiCard
          title="Succeeded"
          value={kpis.success}
          icon={CheckCircle2}
          variant="success"
          loading={isLoading}
        />
        <KpiCard
          title="Failed / partial"
          value={kpis.failed}
          icon={XCircle}
          variant="destructive"
          loading={isLoading}
        />
        <KpiCard
          title="In progress"
          value={kpis.running}
          icon={Clock}
          variant={kpis.running > 0 ? "warning" : "default"}
          loading={isLoading}
        />
      </KpiGrid>

      {/* Recent ALL-scope jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent batch jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : allScopeJobs.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No batch jobs found. Use the &ldquo;Run now&rdquo; button above to trigger one.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right hidden md:table-cell">Products</TableHead>
                    <TableHead className="hidden lg:table-cell">Duration</TableHead>
                    <TableHead className="hidden lg:table-cell">Triggered by</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allScopeJobs.map((job) => (
                    <TableRow key={job.jobId}>
                      <TableCell>
                        <Link
                          href={`/finance/calc-jobs/${job.jobId}`}
                          className="font-mono text-sm font-medium text-primary hover:underline"
                        >
                          {job.jobCode}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{job.period}</TableCell>
                      <TableCell className="text-sm">{job.calculationType}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs font-mono">
                          {job.scope}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={job.status} type="job" size="sm" />
                      </TableCell>
                      <TableCell className="text-right text-sm hidden md:table-cell">
                        {job.successCount > 0 || job.failedCount > 0 ? (
                          <span>
                            <span className="text-green-600">{job.successCount}</span>
                            {job.failedCount > 0 && (
                              <span className="text-destructive"> / {job.failedCount} err</span>
                            )}
                          </span>
                        ) : (
                          job.totalProducts > 0 ? job.totalProducts : "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm hidden lg:table-cell">
                        {fmtDuration(job.durationMs)}
                      </TableCell>
                      <TableCell className="text-sm hidden lg:table-cell">
                        {job.triggeredBy === "CRON" ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <CalendarClock className="h-3 w-3" /> Auto
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{job.triggeredBy || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {fmtDatetime(job.startedAt ?? job.queuedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <NewJobDialog open={newJobOpen} onOpenChange={setNewJobOpen} />
    </div>
  )
}
