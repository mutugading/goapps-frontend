"use client"

// Payroll run & period hooks (T030a). Read-only for runs; approve/close/reopen for periods.
// Run creation/commit stays CLI-only (D-62 (3)).

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient, buildQueryString } from "@/lib/api"
import {
  ApprovePeriodResponse,
  ClosePeriodResponse,
  GetRunDiffResponse,
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

export interface RunDiffParams {
  /** "" / "active" | "legacy" | "run:<id>". */
  against?: string
  nik?: string
  category?: string
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
  diff: (runId: number, params: RunDiffParams) =>
    [...payrollRunKeys.all, "diff", runId, JSON.stringify(params)] as const,
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

export function usePayrollRunDiff(runId: number, params: RunDiffParams = {}, enabled = true) {
  return useQuery({
    queryKey: payrollRunKeys.diff(runId, params),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/api/v1/payroll/runs/${runId}/diff${buildQueryString({ ...params })}`
      )
      const res = GetRunDiffResponse.fromJSON(raw)
      return {
        data: res.data ?? null,
        pagination: {
          currentPage: res.pagination?.currentPage || 1,
          pageSize: res.pagination?.pageSize || params.pageSize || 100,
          totalItems: Number(res.pagination?.totalItems ?? 0),
          totalPages: res.pagination?.totalPages || 0,
        },
      }
    },
    enabled: runId > 0 && enabled,
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

export type PayrollReportKind = "reco" | "bank"

export interface ExportReportVars {
  kind: PayrollReportKind
  yymm: number
  division: string
  /** YYYY-MM-DD; required for bank. */
  transferDate?: string
}

export function reportExportPath({ kind, yymm, division, transferDate }: ExportReportVars): string {
  return `/api/v1/payroll/reports/export${buildQueryString({
    kind,
    yymm,
    division,
    transferDate: kind === "bank" ? transferDate : undefined,
  })}`
}

/** Downloads the reco / bank xlsx of a period (T030d2). Own pending state; resolves true on success. */
export function useExportPayrollReport() {
  const [isDownloading, setIsDownloading] = useState(false)

  const download = async (vars: ExportReportVars): Promise<boolean> => {
    setIsDownloading(true)
    try {
      const res = await fetch(reportExportPath(vars))
      if (!res.ok) {
        let message = "Failed to export report"
        try {
          const json = (await res.json()) as { base?: { message?: string } }
          message = json.base?.message || message
        } catch {
          // non-JSON body: keep the default message
        }
        throw new Error(message)
      }
      const blob = await res.blob()
      const match = /filename="?([^"]+)"?/.exec(res.headers.get("Content-Disposition") ?? "")
      const fileName = match?.[1] ?? `${vars.kind}_${vars.division}_${vars.yymm}.xlsx`
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      const skipped = Number(res.headers.get("X-Skipped-Count") ?? 0)
      toast.success(
        skipped > 0
          ? `Report downloaded (${skipped} ${vars.kind === "bank" ? "employee(s) skipped" : "component(s) without GL setup"})`
          : "Report downloaded"
      )
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export report")
      return false
    } finally {
      setIsDownloading(false)
    }
  }

  return { download, isDownloading }
}
