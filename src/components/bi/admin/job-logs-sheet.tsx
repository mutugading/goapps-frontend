"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, CheckCircle2, Clock, Loader2, MinusCircle, RefreshCw } from "lucide-react"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useBiJobLogs, jobKeys } from "@/hooks/bi/use-job"
import type { BiJobLog } from "@/types/bi"

interface JobLogsSheetProps {
  jobId: string | null
  jobName: string
  onClose: () => void
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s`
}

function formatDateTime(d: Date | undefined): string {
  if (!d) return "—"
  return new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
    case "RUNNING":
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />
    case "FAILED":
      return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
    case "CANCELLED":
      return <MinusCircle className="h-4 w-4 text-muted-foreground shrink-0" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
  }
}

function LogCard({ log }: { log: BiJobLog }) {
  const hasError = Boolean(log.errorMessage)
  return (
    <div className="rounded-md border p-3 space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <StatusIcon status={log.status} />
        <Badge
          variant={log.status === "SUCCESS" ? "default" : log.status === "FAILED" ? "destructive" : "secondary"}
          className="text-xs"
        >
          {log.status}
        </Badge>
        <span className="ml-auto text-xs text-muted-foreground font-mono">#{log.logId}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div>
          <span className="text-muted-foreground">Started</span>
          <div className="font-mono">{formatDateTime(log.startedAt)}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Ended</span>
          <div className="font-mono">{log.endedAt ? formatDateTime(log.endedAt) : "—"}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Duration</span>
          <div className="font-mono">{log.durationMs > 0 ? formatDuration(log.durationMs) : "—"}</div>
        </div>
        <div>
          <span className="text-muted-foreground">Rows affected</span>
          <div className="font-mono">{log.rowsAffected.toLocaleString()}</div>
        </div>
        <div className="col-span-2">
          <span className="text-muted-foreground">Triggered by</span>
          <div className="font-mono truncate">{log.triggeredBy || "—"}</div>
        </div>
      </div>

      {hasError && (
        <div className="rounded bg-destructive/10 border border-destructive/20 px-2 py-1.5 text-xs text-destructive font-mono whitespace-pre-wrap break-all">
          {log.errorMessage}
        </div>
      )}
    </div>
  )
}

export function JobLogsSheet({ jobId, jobName, onClose }: JobLogsSheetProps) {
  const qc = useQueryClient()
  const { data: logs, isLoading, refetch } = useBiJobLogs(jobId ?? undefined, 1, 50)

  const hasRunning = logs?.some((l) => l.status === "RUNNING") ?? false

  // Auto-refresh while any log is RUNNING
  useEffect(() => {
    if (!hasRunning || !jobId) return
    const timer = setInterval(() => {
      void qc.invalidateQueries({ queryKey: jobKeys.logs(jobId, 1) })
    }, 5_000)
    return () => clearInterval(timer)
  }, [hasRunning, jobId, qc])

  return (
    <Sheet open={Boolean(jobId)} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-4 pt-5 pb-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">{jobName} — Logs</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => void refetch()}
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <SheetDescription className="text-xs">
            Last 50 runs. Auto-refreshes every 5s while a run is active.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No runs yet for this job.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => <LogCard key={log.logId} log={log} />)}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
