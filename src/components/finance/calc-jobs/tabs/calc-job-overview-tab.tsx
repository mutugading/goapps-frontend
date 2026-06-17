"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, Package, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/components/common/kpi-card"
import { KpiGrid } from "@/components/common/kpi-grid"
import { StatusBadge } from "@/components/common/status-badge"
import { UserName } from "@/components/common/user-name"
import type { CalJob } from "@/types/finance/cost-calc"

import { fmtDate, fmtDuration, prettyJson } from "./calc-job-tab-utils"

interface Props {
  job: CalJob
}

// Stacked label + value — mirrors request-detail-panel Field pattern
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  )
}

export function CalcJobOverviewTab({ job }: Props) {
  return (
    <div className="space-y-6">
      {/* KPI summary — always show, loading is false since job is already loaded */}
      <KpiGrid cols={4}>
        <KpiCard
          title="Success"
          value={job.successCount}
          variant="success"
          icon={CheckCircle2}
          loading={false}
        />
        <KpiCard
          title="Failed"
          value={job.failedCount}
          variant="destructive"
          icon={XCircle}
          loading={false}
        />
        <KpiCard
          title="Blocked"
          value={job.blockedCount}
          variant="warning"
          icon={AlertTriangle}
          loading={false}
        />
        <KpiCard
          title="Total Products"
          value={job.totalProducts}
          icon={Package}
          loading={false}
        />
      </KpiGrid>

      {/* Bento 2-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Identification</CardTitle>
            </CardHeader>
            {/* grid directly on CardContent — same pattern as request-detail-panel spec card */}
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Job code">
                <span className="font-mono text-xs">{job.jobCode || "—"}</span>
              </Field>
              <Field label="Job ID">
                <span className="font-mono text-xs">{job.jobId}</span>
              </Field>
              <Field label="Period">
                <span className="font-mono text-xs">{job.period}</span>
              </Field>
              <Field label="Calculation type">{job.calculationType}</Field>
              <Field label="Scope">{job.scope.replace(/_/g, " ")}</Field>
              <Field label="Priority">{String(job.priority)}</Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Processing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Total waves">{String(job.totalWaves)}</Field>
              <Field label="Total chunks">{String(job.totalChunks)}</Field>
              <Field label="Processed chunks">{String(job.processedChunks)}</Field>
              <Field label="Total products">{String(job.totalProducts)}</Field>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Lifecycle</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Status">
                <StatusBadge status={job.status} type="job" size="sm" />
              </Field>
              <Field label="Duration">{fmtDuration(job.durationMs)}</Field>
              <Field label="Triggered by">
                {job.triggeredBy ? <UserName userId={job.triggeredBy} compact /> : "—"}
              </Field>
              <Field label="Created by">
                {job.createdBy ? <UserName userId={job.createdBy} compact /> : "—"}
              </Field>
              <Field label="Queued at">{fmtDate(job.queuedAt)}</Field>
              <Field label="Started at">{fmtDate(job.startedAt)}</Field>
              <Field label="Completed at">{fmtDate(job.completedAt)}</Field>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collapsible JSON — full width */}
      <CollapsibleJson title="Product filter" json={job.productFilterJson} />
      <CollapsibleJson title="Error summary" json={job.errorSummaryJson} />
    </div>
  )
}

function CollapsibleJson({ title, json }: { title: string; json: string }) {
  const [open, setOpen] = useState(false)
  const isEmpty = !json || json === "{}" || json === "null"
  if (isEmpty) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setOpen((o) => !o)}>
          {open ? "Collapse" : "Expand"}
        </Button>
      </CardHeader>
      {open && (
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
            {prettyJson(json)}
          </pre>
        </CardContent>
      )}
    </Card>
  )
}
