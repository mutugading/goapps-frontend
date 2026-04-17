"use client"

import { useState, Suspense } from "react"
import { Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"

import {
  SyncTriggerCard,
  ActiveJobStatus,
  LatestJobResult,
  JobHistoryTable,
  JobDetailDialog,
  JobFilters,
  JobPagination,
} from "@/components/finance/oracle-sync"

import { useSyncJobs, useActiveSyncJob } from "@/hooks/finance/use-oracle-sync"
import { useUrlState } from "@/lib/hooks"
import { type SyncJob, type ListSyncJobsParams, JobStatus, isJobActive } from "@/types/finance/oracle-sync"

const defaultFilters: ListSyncJobsParams = {
  page: 1,
  pageSize: 10,
  search: "",
  status: JobStatus.JOB_STATUS_UNSPECIFIED,
}

function OracleSyncPageContent() {
  const [filters, setFilters] = useUrlState<ListSyncJobsParams>({
    defaultValues: defaultFilters,
  })

  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data, isLoading, isError, error } = useSyncJobs(filters)

  // Find active job from the list for polling
  const activeJob = data?.data?.find((j) => isJobActive(j.status))
  const { data: polledJob } = useActiveSyncJob(activeJob)
  const liveActiveJob = polledJob?.data || activeJob

  // Find latest completed job for result display
  const latestCompleted = data?.data?.find((j) =>
    j.status === JobStatus.JOB_STATUS_SUCCESS ||
    j.status === JobStatus.JOB_STATUS_FAILED
  )

  const handleViewDetail = (job: SyncJob) => {
    setSelectedJob(job)
    setIsDetailOpen(true)
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageSize, page: 1 }))
  }

  const totalItems = data?.pagination?.totalItems ?? 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Oracle Sync"
        subtitle="Manage Oracle-to-PostgreSQL data synchronization"
      />

      {/* Trigger Card */}
      <SyncTriggerCard />

      {/* Active Job Status */}
      {liveActiveJob && isJobActive(liveActiveJob.status) && (
        <ActiveJobStatus job={liveActiveJob} />
      )}

      {/* Latest Result */}
      {!liveActiveJob && latestCompleted && (
        <LatestJobResult job={latestCompleted} />
      )}

      {/* Job History */}
      <Card>
        <CardHeader>
          <CardTitle>Job History</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `${totalItems} total sync jobs`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <JobFilters filters={filters} onFiltersChange={setFilters} />

          {isError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load sync jobs"}
            </div>
          )}

          <JobHistoryTable
            data={data?.data || []}
            isLoading={isLoading}
            onViewDetail={handleViewDetail}
          />

          <JobPagination
            pagination={data?.pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <JobDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        job={selectedJob}
      />
    </div>
  )
}

function OracleSyncPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Oracle Sync"
        subtitle="Manage Oracle-to-PostgreSQL data synchronization"
      />
      <Card>
        <CardHeader>
          <CardTitle>Job History</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OracleSyncPageClient() {
  return (
    <Suspense fallback={<OracleSyncPageSkeleton />}>
      <OracleSyncPageContent />
    </Suspense>
  )
}
