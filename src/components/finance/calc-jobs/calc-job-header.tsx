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
import { cn } from "@/lib/utils"
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
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Status + Progress */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Status</p>
              <StatusBadge status={job.status} type="job" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Progress — {job.processedChunks}/{job.totalChunks || "—"} chunks ({pct}%)
              </p>
              <Progress value={pct} className="h-2 w-48" />
            </div>
          </div>

          {/* Right: Mini stat tiles + cancel */}
          <div className="flex flex-wrap items-center gap-2">
            <StatTile
              label="Success"
              value={job.successCount}
              colorClass="text-emerald-700 dark:text-emerald-400"
              bgClass="bg-emerald-100 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/20"
            />
            <StatTile
              label="Failed"
              value={job.failedCount}
              colorClass="text-destructive"
              bgClass="bg-destructive/10 border-destructive/20"
            />
            <StatTile
              label="Blocked"
              value={job.blockedCount}
              colorClass="text-amber-700 dark:text-amber-400"
              bgClass="bg-amber-100 dark:bg-amber-500/15 border-amber-200 dark:border-amber-500/20"
            />
            <StatTile label="Total" value={job.totalProducts} />
            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 text-destructive hover:text-destructive"
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

function StatTile({
  label,
  value,
  colorClass,
  bgClass,
}: {
  label: string
  value: number
  colorClass?: string
  bgClass?: string
}) {
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-center min-w-[64px]", bgClass ?? "bg-muted/40")}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-lg font-semibold tabular-nums leading-none", colorClass ?? "text-foreground")}>
        {value}
      </p>
    </div>
  )
}
