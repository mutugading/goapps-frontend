"use client"

import { XCircle, Loader2, Clock, CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { useCancelSyncJob } from "@/hooks/finance/use-oracle-sync"
import {
  type SyncJob,
  JobStatus,
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANTS,
  formatPeriod,
} from "@/types/finance/oracle-sync"

interface ActiveJobStatusProps {
  job: SyncJob
}

export function ActiveJobStatus({ job }: ActiveJobStatusProps) {
  const cancelMutation = useCancelSyncJob()
  const isActive = job.status === JobStatus.JOB_STATUS_QUEUED || job.status === JobStatus.JOB_STATUS_PROCESSING

  if (!isActive) return null

  const statusIcon = job.status === JobStatus.JOB_STATUS_QUEUED
    ? <Clock className="h-4 w-4" />
    : <Loader2 className="h-4 w-4 animate-spin" />

  return (
    <Card className="border-primary/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {statusIcon}
            Active Sync Job
          </CardTitle>
          <Badge variant={JOB_STATUS_VARIANTS[job.status]}>
            {JOB_STATUS_LABELS[job.status]}
          </Badge>
        </div>
        <CardDescription>
          {job.jobCode} - Period: {formatPeriod(job.period)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{job.progress}%</span>
          </div>
          <Progress value={job.progress} />
        </div>

        {job.status === JobStatus.JOB_STATUS_PROCESSING && job.logs.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Current step: {job.logs[job.logs.length - 1]?.step || "initializing"}
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={() => cancelMutation.mutate(job.jobId)}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <XCircle className="mr-2 h-3 w-3" />
          )}
          Cancel Job
        </Button>
      </CardContent>
    </Card>
  )
}

interface LatestJobResultProps {
  job: SyncJob
}

export function LatestJobResult({ job }: LatestJobResultProps) {
  const isTerminal = job.status === JobStatus.JOB_STATUS_SUCCESS ||
    job.status === JobStatus.JOB_STATUS_FAILED ||
    job.status === JobStatus.JOB_STATUS_CANCELLED

  if (!isTerminal) return null

  return (
    <Card className={job.status === JobStatus.JOB_STATUS_FAILED ? "border-destructive/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {job.status === JobStatus.JOB_STATUS_SUCCESS ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            Last Sync Result
          </CardTitle>
          <Badge variant={JOB_STATUS_VARIANTS[job.status]}>
            {JOB_STATUS_LABELS[job.status]}
          </Badge>
        </div>
        <CardDescription>
          {job.jobCode} - Period: {formatPeriod(job.period)}
        </CardDescription>
      </CardHeader>
      {(job.errorMessage || job.resultSummary) && (
        <CardContent>
          {job.errorMessage && (
            <p className="text-sm text-destructive">{job.errorMessage}</p>
          )}
          {job.resultSummary && (
            <p className="text-sm text-muted-foreground">{job.resultSummary}</p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
