"use client"

import { CheckCircle2, XCircle, Clock, SkipForward } from "lucide-react"

import {
  type SyncJobLog,
  JobLogStatus,
  JOB_LOG_STATUS_LABELS,
  formatDuration,
} from "@/types/finance/oracle-sync"

interface JobLogTimelineProps {
  logs: SyncJobLog[]
}

const LOG_STATUS_ICONS: Record<JobLogStatus, React.ReactNode> = {
  [JobLogStatus.JOB_LOG_STATUS_UNSPECIFIED]: <Clock className="h-4 w-4 text-muted-foreground" />,
  [JobLogStatus.JOB_LOG_STATUS_STARTED]: <Clock className="h-4 w-4 text-blue-500" />,
  [JobLogStatus.JOB_LOG_STATUS_SUCCESS]: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  [JobLogStatus.JOB_LOG_STATUS_FAILED]: <XCircle className="h-4 w-4 text-destructive" />,
  [JobLogStatus.JOB_LOG_STATUS_SKIPPED]: <SkipForward className="h-4 w-4 text-muted-foreground" />,
  [JobLogStatus.UNRECOGNIZED]: <Clock className="h-4 w-4 text-muted-foreground" />,
}

export function JobLogTimeline({ logs }: JobLogTimelineProps) {
  return (
    <div className="space-y-0">
      {logs.map((log, index) => (
        <div key={log.logId} className="flex gap-3 pb-4 last:pb-0">
          {/* Timeline line + icon */}
          <div className="flex flex-col items-center">
            <div className="mt-0.5">
              {LOG_STATUS_ICONS[log.status]}
            </div>
            {index < logs.length - 1 && (
              <div className="w-px flex-1 bg-border mt-1" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pb-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{log.step}</p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {JOB_LOG_STATUS_LABELS[log.status]}
                {log.durationMs > 0 && ` (${formatDuration(log.durationMs)})`}
              </span>
            </div>
            {log.message && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{log.message}</p>
            )}
            {log.startedAt && (
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {new Date(log.startedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
