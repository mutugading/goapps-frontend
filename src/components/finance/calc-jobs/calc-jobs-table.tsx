"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2, XCircle } from "lucide-react"

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
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePermissionContext } from "@/providers/permission-provider"
import { useCancelCalcJob } from "@/hooks/finance/use-cost-calc"
import type { CalJob, CalcJobStatus } from "@/types/finance/cost-calc"
import { CalcJobStatusBadge } from "./calc-job-status-badge"

interface Props {
  items: CalJob[]
  isLoading?: boolean
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

const ACTIVE_STATUSES: CalcJobStatus[] = ["QUEUED", "PLANNING", "PROCESSING"]

function formatDuration(ms: number): string {
  if (!ms || ms <= 0) return "—"
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${(ms / 1000).toFixed(1)}s`
  const m = Math.floor(s / 60)
  const rem = s - m * 60
  return `${m}m ${rem}s`
}

function formatDateTime(ts: string | null | undefined): string {
  if (!ts) return "—"
  try {
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ts
  }
}

export function CalcJobsTable({
  items,
  isLoading,
  page,
  total,
  totalPages,
  onPageChange,
}: Props) {
  const { hasPermission } = usePermissionContext()
  const canCancel = hasPermission("finance.cost.caljob.cancel")
  const cancelMutation = useCancelCalcJob()
  const [cancelTarget, setCancelTarget] = useState<CalJob | null>(null)

  const confirmCancel = async () => {
    if (!cancelTarget) return
    // Race-safe: see calc-job-header.tsx — backend may reject if job already
    // reached a terminal state between user click + request. onError toast in
    // the mutation surfaces the message; swallow re-throw here.
    try {
      await cancelMutation.mutateAsync({ jobId: cancelTarget.jobId })
    } catch {
      // toast already shown by mutation onError
    }
    setCancelTarget(null)
  }

  return (
    <>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">Job code</TableHead>
              <TableHead className="w-24">Period</TableHead>
              <TableHead className="w-24">Calc type</TableHead>
              <TableHead className="w-32">Scope</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-28">Progress</TableHead>
              <TableHead className="w-20 text-right">Success</TableHead>
              <TableHead className="w-20 text-right">Failed</TableHead>
              <TableHead className="w-20 text-right">Blocked</TableHead>
              <TableHead className="w-24 text-right">Duration</TableHead>
              <TableHead className="w-28">Triggered by</TableHead>
              <TableHead className="w-44">Queued at</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={13} className="py-8 text-center text-muted-foreground">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="py-8 text-center text-muted-foreground">
                  No calc jobs yet. Trigger one with the &ldquo;+ New job&rdquo; button.
                </TableCell>
              </TableRow>
            )}
            {items.map((job) => {
              const isActive = ACTIVE_STATUSES.includes(job.status)
              return (
                <TableRow key={job.jobId} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">
                    <Link
                      href={`/finance/calc-jobs/${job.jobId}`}
                      className="text-primary hover:underline"
                    >
                      {job.jobCode || `#${job.jobId}`}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{job.period}</TableCell>
                  <TableCell className="text-xs">{job.calculationType}</TableCell>
                  <TableCell className="text-xs">{job.scope.replace("_", " ")}</TableCell>
                  <TableCell>
                    <CalcJobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {job.processedChunks}/{job.totalChunks || "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-700">
                    {job.successCount}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-red-700">
                    {job.failedCount}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-amber-700">
                    {job.blockedCount}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {formatDuration(job.durationMs)}
                  </TableCell>
                  <TableCell className="text-xs">{job.triggeredBy || "—"}</TableCell>
                  <TableCell className="text-xs">{formatDateTime(job.queuedAt)}</TableCell>
                  <TableCell className="text-right">
                    {isActive && canCancel ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setCancelTarget(job)}
                        disabled={cancelMutation.isPending}
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Cancel
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/finance/calc-jobs/${job.jobId}`}>Open</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {total > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing page {page} of {totalPages} ({total} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel calc job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will signal job{" "}
              <strong className="font-mono">
                {cancelTarget?.jobCode || `#${cancelTarget?.jobId}`}
              </strong>{" "}
              to stop. In-flight chunks may continue until they finish, but no
              new chunks will be dispatched.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Keep running
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling…" : "Cancel job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
