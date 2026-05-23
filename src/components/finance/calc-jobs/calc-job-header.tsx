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
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { useCancelCalcJob } from "@/hooks/finance/use-cost-calc"
import { usePermissionContext } from "@/providers/permission-provider"
import type { CalJob, CalcJobStatus } from "@/types/finance/cost-calc"

import { CalcJobStatusBadge } from "./calc-job-status-badge"

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
    // Race-safe: job may transition to terminal state (SUCCESS / PARTIAL_FAILED /
    // FAILED) between user clicking Cancel and the request hitting the backend.
    // useCancelCalcJob's onError toast already surfaces the message; swallow
    // the re-throw to avoid Next.js's unhandled-rejection runtime error.
    try {
      await cancel.mutateAsync({ jobId: job.jobId, reason: reason.trim() || undefined })
    } catch {
      // toast already shown by mutation onError
    }
    setReason("")
    setOpen(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-6 py-2">
      <CalcJobStatusBadge status={job.status} />
      <div className="min-w-[220px] space-y-1">
        <div className="text-xs text-muted-foreground">Progress</div>
        <div className="flex items-center gap-2">
          <Progress value={pct} className="w-32" />
          <span className="text-sm tabular-nums">
            {job.processedChunks}/{job.totalChunks || "—"}
          </span>
          <span className="text-xs text-muted-foreground">({pct}%)</span>
        </div>
      </div>
      <CountBlock label="Success" value={job.successCount} colorClass="text-emerald-600" />
      <CountBlock label="Failed" value={job.failedCount} colorClass="text-red-600" />
      <CountBlock label="Blocked" value={job.blockedCount} colorClass="text-amber-600" />
      <CountBlock label="Total" value={job.totalProducts} />
      {canCancel && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={() => setOpen(true)}
          disabled={cancel.isPending}
        >
          <XCircle className="mr-1 h-3 w-3" /> Cancel job
        </Button>
      )}

      <AlertDialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel calc job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will signal job{" "}
              <strong className="font-mono">{job.jobCode || `#${job.jobId}`}</strong> to
              stop. In-flight chunks may continue until they finish, but no new chunks will
              be dispatched.
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
    </div>
  )
}

function CountBlock({
  label,
  value,
  colorClass,
}: {
  label: string
  value: number
  colorClass?: string
}) {
  return (
    <div className="min-w-[72px]">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold tabular-nums ${colorClass ?? ""}`}>{value}</div>
    </div>
  )
}
