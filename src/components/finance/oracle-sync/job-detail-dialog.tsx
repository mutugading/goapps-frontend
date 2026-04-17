"use client"

import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useSyncJob } from "@/hooks/finance/use-oracle-sync"
import {
  type SyncJob,
  JOB_STATUS_LABELS,
  JOB_STATUS_VARIANTS,
  formatPeriod,
} from "@/types/finance/oracle-sync"
import { JobLogTimeline } from "./job-log-timeline"

interface JobDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  job: SyncJob | null
}

export function JobDetailDialog({ open, onOpenChange, job }: JobDetailDialogProps) {
  const { data, isLoading } = useSyncJob(job?.jobId || "", open && !!job)

  const detail = data?.data || job

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Detail</DialogTitle>
          <DialogDescription>
            {detail?.jobCode || "Loading..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && !detail && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {detail && (
          <div className="space-y-6">
            {/* Job Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Job Code</p>
                <p className="font-mono font-medium">{detail.jobCode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={JOB_STATUS_VARIANTS[detail.status]}>
                  {JOB_STATUS_LABELS[detail.status]}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Period</p>
                <p>{formatPeriod(detail.period)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Progress</p>
                <p>{detail.progress}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Triggered By</p>
                <p>{detail.createdBy || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Queued At</p>
                <p>{detail.queuedAt ? new Date(detail.queuedAt).toLocaleString() : "-"}</p>
              </div>
              {detail.startedAt && (
                <div>
                  <p className="text-muted-foreground">Started At</p>
                  <p>{new Date(detail.startedAt).toLocaleString()}</p>
                </div>
              )}
              {detail.completedAt && (
                <div>
                  <p className="text-muted-foreground">Completed At</p>
                  <p>{new Date(detail.completedAt).toLocaleString()}</p>
                </div>
              )}
              {detail.cancelledBy && (
                <div>
                  <p className="text-muted-foreground">Cancelled By</p>
                  <p>{detail.cancelledBy}</p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {detail.errorMessage && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-sm text-destructive/80 mt-1">{detail.errorMessage}</p>
              </div>
            )}

            {/* Result Summary */}
            {detail.resultSummary && (
              <div className="rounded-lg border p-3">
                <p className="text-sm font-medium">Result Summary</p>
                <p className="text-sm text-muted-foreground mt-1">{detail.resultSummary}</p>
              </div>
            )}

            {/* Execution Logs */}
            {detail.logs && detail.logs.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Execution Logs</h4>
                <JobLogTimeline logs={detail.logs} />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
