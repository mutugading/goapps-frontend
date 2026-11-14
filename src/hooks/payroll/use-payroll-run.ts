"use client"

// Payroll run & period hooks (T030a). Read-only for runs; approve/close/reopen for periods.
// Run creation/commit stays CLI-only (D-62 (3)).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient, buildQueryString } from "@/lib/api"
import {
  ApprovePeriodResponse,
  ClosePeriodResponse,
  GetRunResponse,
  ListPeriodsResponse,
  ListRunLinesResponse,
  ListRunsResponse,
  ReopenPeriodResponse,
} from "@/types/generated/payroll/v1/run"

export interface ListRunsParams {
  yymm?: number
  division?: string
}

export interface ListRunLinesParams {
  nik?: string
  page?: number
  pageSize?: number
}

export type PeriodAction = "approve" | "close" | "reopen"

export const payrollRunKeys = {
  all: ["payroll", "run"] as const,
  lists: () => [...payrollRunKeys.all, "list"] as const,
  list: (params: ListRunsParams) => [...payrollRunKeys.lists(), JSON.stringify(params)] as const,
  detail: (runId: number) => [...payrollRunKeys.all, "detail", runId] as const,
  lines: (runId: number, params: ListRunLinesParams) =>
    [...payrollRunKeys.all, "lines", runId, JSON.stringify(params)] as const,
}

export const payrollPeriodKeys = {
  all: ["payroll", "period"] as const,
  lists: () => [...payrollPeriodKeys.all, "list"] as const,
  list: (division?: string) => [...payrollPeriodKeys.lists(), division ?? ""] as const,
}

export function periodActionPath(action: PeriodAction, yymm: number, division: string): string {
  return `/api/v1/payroll/periods/${yymm}/${encodeURIComponent(division)}/${action}`
}

export function usePayrollRuns(params: ListRunsParams = {}) {
  return useQuery({
    queryKey: payrollRunKeys.list(params),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/payroll/runs${buildQueryString({ ...params })}`)
      return ListRunsResponse.fromJSON(raw).data ?? []
    },
    staleTime: 30_000,
  })
}

export function usePayrollRun(runId: number) {
  return useQuery({
    queryKey: payrollRunKeys.detail(runId),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/payroll/runs/${runId}`)
      return GetRunResponse.fromJSON(raw).data ?? null
    },
    enabled: runId > 0,
    staleTime: 30_000,
  })
}

export function usePayrollRunLines(runId: number, params: ListRunLinesParams = {}) {
  return useQuery({
    queryKey: payrollRunKeys.lines(runId, params),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/api/v1/payroll/runs/${runId}/lines${buildQueryString({ ...params })}`
      )
      const res = ListRunLinesResponse.fromJSON(raw)
      return {
        data: res.data ?? [],
        pagination: {
          currentPage: res.pagination?.currentPage || 1,
          pageSize: res.pagination?.pageSize || params.pageSize || 100,
          totalItems: Number(res.pagination?.totalItems ?? 0),
          totalPages: res.pagination?.totalPages || 0,
        },
      }
    },
    enabled: runId > 0,
    staleTime: 30_000,
  })
}

export function usePayrollPeriods(division?: string) {
  return useQuery({
    queryKey: payrollPeriodKeys.list(division),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/payroll/periods${buildQueryString({ division })}`)
      return ListPeriodsResponse.fromJSON(raw).data ?? []
    },
    staleTime: 30_000,
  })
}

interface PeriodActionVars {
  yymm: number
  division: string
  /** Required (>= 10 characters) for reopen only. */
  reason?: string
}

function usePeriodMutation(action: PeriodAction, parse: (raw: unknown) => { data?: unknown }, okMessage: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ yymm, division, reason }: PeriodActionVars) => {
      const body = action === "reopen" ? { reason: reason ?? "" } : {}
      const raw = await apiClient.post<unknown>(periodActionPath(action, yymm, division), body)
      return parse(raw)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: payrollPeriodKeys.all })
      qc.invalidateQueries({ queryKey: payrollRunKeys.all })
      toast.success(okMessage)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payroll period action failed")
    },
  })
}

export const useApprovePeriod = () =>
  usePeriodMutation("approve", (r) => ApprovePeriodResponse.fromJSON(r), "Period approved")
export const useClosePeriod = () =>
  usePeriodMutation("close", (r) => ClosePeriodResponse.fromJSON(r), "Period closed")
export const useReopenPeriod = () =>
  usePeriodMutation("reopen", (r) => ReopenPeriodResponse.fromJSON(r), "Period reopened")
