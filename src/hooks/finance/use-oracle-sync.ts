"use client"

// Oracle Sync Hooks - Custom TanStack Query hooks for Oracle sync operations

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient, buildQueryString } from "@/lib/api"
import type {
  TriggerSyncResponse,
  GetSyncJobResponse,
  ListSyncJobsResponse,
  CancelSyncJobResponse,
  ListItemConsStockPOResponse,
  ListSyncPeriodsResponse,
  SyncJob,
} from "@/types/finance/oracle-sync"
import type { ListSyncJobsParams, ListItemConsStockPOParams } from "@/types/finance/oracle-sync"
import {
  TriggerSyncResponseParser,
  GetSyncJobResponseParser,
  ListSyncJobsResponseParser,
  CancelSyncJobResponseParser,
  ListItemConsStockPOResponseParser,
  ListSyncPeriodsResponseParser,
} from "@/types/finance/oracle-sync"

// ============================================================================
// Query Keys
// ============================================================================

export const oracleSyncKeys = {
  all: ["finance", "oracle-sync"] as const,
  jobs: () => [...oracleSyncKeys.all, "jobs"] as const,
  jobList: (params: ListSyncJobsParams) => [...oracleSyncKeys.jobs(), "list", params] as const,
  jobDetail: (id: string) => [...oracleSyncKeys.jobs(), "detail", id] as const,
  periods: () => [...oracleSyncKeys.all, "periods"] as const,
  data: () => ["finance", "item-cons-stock-po"] as const,
  dataList: (params: ListItemConsStockPOParams) => [...oracleSyncKeys.data(), "list", params] as const,
}

// ============================================================================
// Sync Jobs Hooks
// ============================================================================

export function useSyncJobs(params: ListSyncJobsParams) {
  return useQuery({
    queryKey: oracleSyncKeys.jobList(params),
    queryFn: async (): Promise<ListSyncJobsResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const raw = await apiClient.get<unknown>(`/api/v1/finance/oracle-sync/jobs${queryString}`)
      return ListSyncJobsResponseParser.fromJSON(raw)
    },
    staleTime: 30_000,
  })
}

export function useSyncJob(jobId: string, enabled = true) {
  return useQuery({
    queryKey: oracleSyncKeys.jobDetail(jobId),
    queryFn: async (): Promise<GetSyncJobResponse> => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/oracle-sync/jobs/${jobId}`)
      return GetSyncJobResponseParser.fromJSON(raw)
    },
    staleTime: 10_000,
    enabled: enabled && !!jobId,
  })
}

export function useTriggerSync() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (period?: string): Promise<TriggerSyncResponse> => {
      const raw = await apiClient.post<unknown>("/api/v1/finance/oracle-sync/jobs", {
        period: period || "",
      })
      return TriggerSyncResponseParser.fromJSON(raw)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess) {
        queryClient.invalidateQueries({ queryKey: oracleSyncKeys.jobs() })
        toast.success("Sync job triggered successfully")
      } else {
        toast.error(response.base?.message || "Failed to trigger sync")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to trigger sync")
    },
  })
}

export function useCancelSyncJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (jobId: string): Promise<CancelSyncJobResponse> => {
      const raw = await apiClient.post<unknown>(`/api/v1/finance/oracle-sync/jobs/${jobId}`)
      return CancelSyncJobResponseParser.fromJSON(raw)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess) {
        queryClient.invalidateQueries({ queryKey: oracleSyncKeys.jobs() })
        toast.success("Sync job cancelled")
      } else {
        toast.error(response.base?.message || "Failed to cancel sync job")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel sync job")
    },
  })
}

// ============================================================================
// Periods Hook
// ============================================================================

export function useSyncPeriods() {
  return useQuery({
    queryKey: oracleSyncKeys.periods(),
    queryFn: async (): Promise<ListSyncPeriodsResponse> => {
      const raw = await apiClient.get<unknown>("/api/v1/finance/oracle-sync/periods")
      return ListSyncPeriodsResponseParser.fromJSON(raw)
    },
    staleTime: 60_000,
  })
}

// ============================================================================
// Item Cons Stock PO Data Hook
// ============================================================================

export function useItemConsStockPO(params: ListItemConsStockPOParams) {
  return useQuery({
    queryKey: oracleSyncKeys.dataList(params),
    queryFn: async (): Promise<ListItemConsStockPOResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const raw = await apiClient.get<unknown>(`/api/v1/finance/item-cons-stock-po${queryString}`)
      return ListItemConsStockPOResponseParser.fromJSON(raw)
    },
    staleTime: 30_000,
  })
}

// ============================================================================
// Polling Hook for Active Jobs
// ============================================================================

export function useActiveSyncJob(activeJob: SyncJob | undefined) {
  return useQuery({
    queryKey: oracleSyncKeys.jobDetail(activeJob?.jobId || ""),
    queryFn: async (): Promise<GetSyncJobResponse> => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/oracle-sync/jobs/${activeJob?.jobId}`)
      return GetSyncJobResponseParser.fromJSON(raw)
    },
    enabled: !!activeJob?.jobId,
    refetchInterval: 5_000,
    staleTime: 3_000,
  })
}
