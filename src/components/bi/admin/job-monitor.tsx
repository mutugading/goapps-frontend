"use client"

// Job monitor — ETL job registry + manual trigger + CRUD actions.

import { useState } from "react"
import { Pencil, Play, Plus, Trash2 } from "lucide-react"

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
import { useBiJobs, useTriggerBiJob, useDeleteJob } from "@/hooks/bi/use-job"
import type { BiJob } from "@/types/bi"
import { JobFormDialog } from "./job-form-dialog"

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  SUCCESS: "default",
  RUNNING: "secondary",
  FAILED: "destructive",
  CANCELLED: "outline",
}

export function JobMonitor() {
  const { data: jobs, isLoading } = useBiJobs(true)
  const triggerMut = useTriggerBiJob()
  const deleteMut  = useDeleteJob()

  const [formOpen, setFormOpen]   = useState(false)
  const [editJob,  setEditJob]    = useState<BiJob | null>(null)
  const [deleteJob, setDeleteJob] = useState<BiJob | null>(null)

  function openCreate() {
    setEditJob(null)
    setFormOpen(true)
  }

  function openEdit(job: BiJob) {
    setEditJob(job)
    setFormOpen(true)
  }

  return (
    <>
      <div className="rounded-lg border">
        {/* Header row */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium text-muted-foreground">ETL Jobs</p>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            New Job
          </Button>
        </div>

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
              <TableRow>
                <TableCell colSpan={6}>
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ) : !jobs || jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No ETL jobs registered. Click &quot;New Job&quot; to add one.
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((j) => (
                <TableRow key={j.jobId}>
                  <TableCell className="font-medium">
                    {j.jobName}
                    {!j.isActive && (
                      <Badge variant="outline" className="ml-2 text-xs">inactive</Badge>
                    )}
                  </TableCell>
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
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(j)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>

                      {/* Delete */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteJob(j)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>

                      {/* Trigger */}
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
                            <AlertDialogAction onClick={() => void triggerMut.mutateAsync(j.jobId)}>
                              Trigger
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / edit dialog */}
      <JobFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        job={editJob}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteJob)}
        onOpenChange={(open) => { if (!open) setDeleteJob(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteJob?.jobName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the ETL job from the registry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteJob) {
                  void deleteMut.mutateAsync(deleteJob.jobId).then(() => setDeleteJob(null))
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
