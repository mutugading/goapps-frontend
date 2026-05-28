"use client"

// BI ETL job hooks — list jobs, list logs, trigger.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"
import type {
  BiJob,
  BiJobLog,
  ListJobsResponse,
  ListJobLogsResponse,
  TriggerJobResponse,
} from "@/types/bi"
import {
  ListJobsResponseParser,
  ListJobLogsResponseParser,
  TriggerJobResponseParser,
} from "@/types/bi"

export const jobKeys = {
  all: ["finance", "bi-job"] as const,
  list: (includeInactive: boolean) => [...jobKeys.all, "list", includeInactive] as const,
  logs: (jobId: string, page: number) => [...jobKeys.all, "logs", jobId, page] as const,
}

/** List ETL jobs with last-run summary. */
export function useBiJobs(includeInactive = false) {
  return useQuery<BiJob[]>({
    queryKey: jobKeys.list(includeInactive),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/bi/jobs?includeInactive=${includeInactive}`)
      const parsed: ListJobsResponse = ListJobsResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to list jobs")
      return parsed.data
    },
    staleTime: 30_000,
  })
}

/** Paginated logs for one job. */
export function useBiJobLogs(jobId: string | undefined, page = 1, pageSize = 20) {
  return useQuery<BiJobLog[]>({
    queryKey: jobKeys.logs(jobId ?? "", page),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/bi/jobs/${jobId}/logs?page=${page}&pageSize=${pageSize}`)
      const parsed: ListJobLogsResponse = ListJobLogsResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to list job logs")
      return parsed.data
    },
    enabled: Boolean(jobId),
    staleTime: 15_000,
  })
}

/** Manually trigger a job run. */
export function useTriggerBiJob() {
  const qc = useQueryClient()
  return useMutation<BiJobLog | undefined, Error, string>({
    mutationFn: async (jobId) => {
      const raw = await apiClient.post<unknown>(`/api/v1/finance/bi/jobs/${jobId}/trigger`, {})
      const parsed: TriggerJobResponse = TriggerJobResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to trigger job")
      return parsed.data
    },
    onSuccess: () => {
      toast.success("Job triggered")
      void qc.invalidateQueries({ queryKey: jobKeys.all })
    },
    onError: (err) => toast.error(err.message),
  })
}
