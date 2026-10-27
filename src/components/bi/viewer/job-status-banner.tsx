"use client"

// Workforce dashboards: "data per run terakhir" + warning when the latest ETL run failed (PRD §8, H014).

import { AlertTriangle } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useBiJobs, useBiJobLogs } from "@/hooks/bi/use-job"
import type { BiJob } from "@/types/bi"

const HR_JOB_PREFIX = "ETL_HR_"

const fmt = (d?: Date | string) => {
  if (!d) return undefined
  const date = typeof d === "string" ? new Date(d) : d
  return isNaN(date.getTime())
    ? undefined
    : date.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }) + " WIB"
}

const time = (d?: Date | string) => (d ? new Date(d).getTime() || 0 : 0)

/** Shows the latest successful HR ETL run and a banner when the most recent run failed. */
export function JobStatusBanner() {
  const { data: jobs, error } = useBiJobs(false)
  const hrJobs = (jobs ?? []).filter(j => j.jobName.startsWith(HR_JOB_PREFIX))

  // Most recently executed job decides whether to warn.
  const latest: BiJob | undefined = [...hrJobs].sort((a, b) => time(b.lastRunAt) - time(a.lastRunAt))[0]
  const failed = latest?.lastStatus === "FAILED"

  // Last success: a job whose last run succeeded gives it directly; otherwise look in the failing job's logs.
  const okJobs = hrJobs.filter(j => j.lastStatus === "SUCCESS")
  const { data: logs } = useBiJobLogs(failed ? latest?.jobId : undefined, 1, 20)
  const logSuccess = logs?.find(l => l.status === "SUCCESS")
  const candidates = [
    ...okJobs.map(j => j.lastRunAt),
    ...(logSuccess ? [logSuccess.endedAt ?? logSuccess.startedAt] : []),
  ].filter(Boolean) as Date[]
  const lastSuccess = candidates.sort((a, b) => time(b) - time(a))[0]

  // Roles without job.view (e.g. HR) get 403: hide the banner quietly. A lightweight ETL status endpoint
  // for them is tracked as H062. Any other error also hides it; the banner is informational only.
  if (error || hrJobs.length === 0) return null

  return (
    <div className="space-y-3">
      <Badge variant="outline" className="gap-1.5 font-normal">
        <span className={`h-2 w-2 rounded-full ${lastSuccess ? "bg-emerald-500" : "bg-muted-foreground"}`} />
        {lastSuccess ? `Data per ${fmt(lastSuccess)}` : "Belum ada run sukses"}
      </Badge>
      {failed && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Run data terakhir gagal</AlertTitle>
          <AlertDescription>
            Job {latest?.jobName} gagal pada {fmt(latest?.lastRunAt) ?? "-"}. Data di dashboard ini
            {lastSuccess ? ` masih dari run sukses ${fmt(lastSuccess)}` : " mungkin belum lengkap"}; hubungi admin BI.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
