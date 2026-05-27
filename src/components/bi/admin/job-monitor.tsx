"use client"

// Job monitor — ETL job registry + manual trigger + last-run summary.

import { Play } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useBiJobs, useTriggerBiJob } from "@/hooks/bi/use-job"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUCCESS: "default",
  RUNNING: "secondary",
  FAILED: "destructive",
  CANCELLED: "outline",
}

export function JobMonitor() {
  const { data: jobs, isLoading } = useBiJobs(true)
  const triggerMut = useTriggerBiJob()

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Job</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
          ) : !jobs || jobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                No ETL jobs registered (Oracle bridge ships in a later phase)
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((j) => (
              <TableRow key={j.jobId}>
                <TableCell className="font-medium">{j.jobName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{j.sourceCode}</TableCell>
                <TableCell className="text-sm">{j.targetType}</TableCell>
                <TableCell className="font-mono text-xs">{j.scheduleCron || "manual"}</TableCell>
                <TableCell>
                  {j.lastStatus ? (
                    <Badge variant={STATUS_VARIANT[j.lastStatus] ?? "outline"}>{j.lastStatus}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">never</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Play className="mr-1 h-3 w-3" />
                        Trigger
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Trigger {j.jobName}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This records a manual run. The real Oracle bridge is wired in a later phase.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void triggerMut.mutateAsync(j.jobId)}>Trigger</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
