"use client"

import { useState } from "react"

import { Card } from "@/components/ui/card"
import { UserName } from "@/components/common/user-name"
import type { CalJob } from "@/types/finance/cost-calc"

interface Props {
  job: CalJob
}

function fmtDate(ts: string | null): string {
  if (!ts) return "—"
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  } catch {
    return ts
  }
}

function fmtDuration(ms: number): string {
  if (!ms || ms <= 0) return "—"
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${(ms / 1000).toFixed(1)}s`
  const m = Math.floor(s / 60)
  const rem = s - m * 60
  if (m < 60) return `${m}m ${rem}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m - h * 60}m`
}

function prettyJson(s: string): string {
  if (!s) return ""
  try {
    return JSON.stringify(JSON.parse(s), null, 2)
  } catch {
    return s
  }
}

export function CalcJobOverviewTab({ job }: Props) {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Identification</h3>
        <Grid>
          <Row label="Job code" value={<span className="font-mono">{job.jobCode || "—"}</span>} />
          <Row label="Job ID" value={<span className="font-mono">{job.jobId}</span>} />
          <Row label="Period" value={<span className="font-mono">{job.period}</span>} />
          <Row label="Calculation type" value={job.calculationType} />
          <Row label="Scope" value={job.scope.replace(/_/g, " ")} />
          <Row label="Priority" value={String(job.priority)} />
        </Grid>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Lifecycle</h3>
        <Grid>
          <Row label="Status" value={job.status} />
          <Row
            label="Triggered by"
            value={job.triggeredBy ? <UserName userId={job.triggeredBy} compact /> : "—"}
          />
          <Row
            label="Created by"
            value={job.createdBy ? <UserName userId={job.createdBy} compact /> : "—"}
          />
          <Row label="Queued at" value={fmtDate(job.queuedAt)} />
          <Row label="Started at" value={fmtDate(job.startedAt)} />
          <Row label="Completed at" value={fmtDate(job.completedAt)} />
          <Row label="Duration" value={fmtDuration(job.durationMs)} />
        </Grid>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Counts</h3>
        <Grid>
          <Row label="Total products" value={String(job.totalProducts)} />
          <Row label="Total chunks" value={String(job.totalChunks)} />
          <Row label="Total waves" value={String(job.totalWaves)} />
          <Row label="Processed chunks" value={String(job.processedChunks)} />
          <Row
            label="Success"
            value={<span className="font-mono text-emerald-700">{job.successCount}</span>}
          />
          <Row
            label="Failed"
            value={<span className="font-mono text-red-700">{job.failedCount}</span>}
          />
          <Row
            label="Blocked"
            value={<span className="font-mono text-amber-700">{job.blockedCount}</span>}
          />
        </Grid>
      </Card>

      <CollapsibleJson title="Product filter" json={job.productFilterJson} />
      <CollapsibleJson title="Error summary" json={job.errorSummaryJson} />
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-2 md:grid-cols-2">{children}</div>
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/40 py-1.5 last:border-b-0">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{value}</div>
    </div>
  )
}

function CollapsibleJson({ title, json }: { title: string; json: string }) {
  const [open, setOpen] = useState(false)
  const isEmpty = !json || json === "{}" || json === "null"
  if (isEmpty) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground">empty</span>
        </div>
      </Card>
    )
  }
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">{title}</h3>
        <button
          type="button"
          className="text-xs text-primary hover:underline"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Collapse" : "Expand"}
        </button>
      </div>
      {open && (
        <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-xs">
          {prettyJson(json)}
        </pre>
      )}
    </Card>
  )
}
