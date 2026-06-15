"use client"

import { useState } from "react"
import { XCircle } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { StatusBadge } from "@/components/common/status-badge"
import { useCancelCalcJob } from "@/hooks/finance/use-cost-calc"
import { usePermissionContext } from "@/providers/permission-provider"
import type { CalJob, CalcJobStatus } from "@/types/finance/cost-calc"

interface Props {
  job: CalJob
}

const ACTIVE_STATES = new Set<CalcJobStatus>(["QUEUED", "PLANNING", "PROCESSING"])

export function CalcJobHeader({ job }: Props) {
  const { hasPermission } = usePermissionContext()
  const cancel = useCancelCalcJob()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const isActive = ACTIVE_STATES.has(job.status)
  const canCancel = isActive && hasPermission("finance.cost.caljob.cancel")
  const pct =
    job.totalChunks > 0
      ? Math.min(100, Math.round((job.processedChunks / job.totalChunks) * 100))
      : 0

  async function confirm() {
    try {
      await cancel.mutateAsync({ jobId: job.jobId, reason: reason.trim() || undefined })
    } catch {
      // toast already shown by mutation onError
    }
    setReason("")
    setOpen(false)
  }

  return (
    <Card>
      <CardContent className="pt-6 pb-5">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Status + progress */}
          <div className="flex flex-wrap items-start gap-6">
            <div className="space-y-1.5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Status</div>
              <StatusBadge status={job.status} type="job" />
            </div>

            <div className="space-y-1.5">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={pct} className="h-2 w-36" />
                <span className="text-sm tabular-nums">
                  {job.processedChunks}/{job.totalChunks || "—"}
                </span>
                <span className="text-xs text-muted-foreground">({pct}%)</span>
              </div>
            </div>
          </div>

          {/* Count stats + cancel */}
          <div className="flex flex-wrap items-end gap-6">
            <Stat label="Success" value={job.successCount} colorClass="text-emerald-600" />
            <Stat label="Failed" value={job.failedCount} colorClass="text-red-600" />
            <Stat label="Blocked" value={job.blockedCount} colorClass="text-amber-600" />
            <Stat label="Total" value={job.totalProducts} />
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setOpen(true)}
                disabled={cancel.isPending}
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel job
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <AlertDialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel calc job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will signal job{" "}
              <strong className="font-mono">{job.jobCode || `#${job.jobId}`}</strong> to stop.
              In-flight chunks may continue until they finish, but no new chunks will be
              dispatched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Reason (optional)</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Wrong period; will re-trigger after parameter fix"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancel.isPending}>Keep running</AlertDialogCancel>
            <AlertDialogAction onClick={confirm} disabled={cancel.isPending}>
              {cancel.isPending ? "Cancelling…" : "Cancel job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function Stat({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass?: string
}) {
  return (
    <div className="text-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`mt-0.5 text-xl font-semibold tabular-nums ${colorClass ?? ""}`}>{value}</div>
    </div>
  )
}
