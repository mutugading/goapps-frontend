"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  type CalJob,
  type CalJobChunk,
  type CalJobProduct,
  type CalcJobScope,
  type CalcJobStatus,
  type CalculationType,
  type CostBreakdown,
  type CostHistoryEntry,
  type CostResult,
  type ListCalcJobChunksParams,
  type ListCalcJobProductsParams,
  type ListCalcJobsParams,
  type ListCostHistoryParams,
  normalizeCalJob,
  normalizeCalJobChunk,
  normalizeCalJobProduct,
  normalizeCostBreakdown,
  normalizeCostHistoryEntry,
  normalizeCostResult,
} from "@/types/finance/cost-calc"

const KEYS = {
  all: ["finance", "cost-calc"] as const,
  jobs: (p: ListCalcJobsParams) => ["finance", "cost-calc", "jobs", p] as const,
  job: (id: number) => ["finance", "cost-calc", "job", id] as const,
  jobChunks: (id: number, p: ListCalcJobChunksParams) =>
    ["finance", "cost-calc", "job", id, "chunks", p] as const,
  jobProducts: (id: number, p: ListCalcJobProductsParams) =>
    ["finance", "cost-calc", "job", id, "products", p] as const,
  result: (pid: number, period: string, type: CalculationType) =>
    ["finance", "cost-calc", "result", pid, period, type] as const,
  breakdown: (pid: number, period: string, type: CalculationType) =>
    ["finance", "cost-calc", "breakdown", pid, period, type] as const,
  history: (pid: number, p: ListCostHistoryParams) =>
    ["finance", "cost-calc", "history", pid, p] as const,
}

interface BFFResponse<T> {
  base?: { isSuccess?: boolean; message?: string; statusCode?: string }
  data?: T
  pagination?: {
    currentPage?: number
    pageSize?: number
    totalItems?: string | number
    totalPages?: number
  }
}

function ensureOK<T>(json: BFFResponse<T>): T {
  if (!json.base?.isSuccess) {
    throw new Error(json.base?.message || "request failed")
  }
  return json.data as T
}

// ---------- list jobs ----------

export interface ListCalcJobsResult {
  items: CalJob[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useCalcJobs(params: ListCalcJobsParams = {}) {
  return useQuery({
    queryKey: KEYS.jobs(params),
    queryFn: async (): Promise<ListCalcJobsResult> => {
      const qs = new URLSearchParams()
      if (params.period) qs.set("period", params.period)
      if (params.calculationType) qs.set("calculationType", params.calculationType)
      if (params.status) qs.set("status", params.status)
      if (params.triggeredBy) qs.set("triggeredBy", params.triggeredBy)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/calc-jobs?${qs.toString()}`)
      const json = (await res.json()) as BFFResponse<unknown[]>
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "list calc jobs failed")
      const items = ((json.data as unknown[]) || []).map((row) =>
        normalizeCalJob(row as Record<string, unknown>),
      )
      const pag = json.pagination
      return {
        items,
        total: Number(pag?.totalItems ?? items.length),
        page: pag?.currentPage ?? 1,
        pageSize: pag?.pageSize ?? items.length,
        totalPages: pag?.totalPages ?? 1,
      }
    },
    staleTime: 30_000,
  })
}

// ---------- single job (polls while active) ----------

const ACTIVE_JOB_STATUSES: CalcJobStatus[] = ["QUEUED", "PLANNING", "PROCESSING"]

export function useCalcJob(jobId: number | undefined) {
  return useQuery({
    queryKey: KEYS.job(jobId ?? 0),
    enabled: !!jobId,
    queryFn: async (): Promise<CalJob | null> => {
      if (!jobId) return null
      const res = await fetch(`/api/v1/finance/calc-jobs/${jobId}`)
      const json = (await res.json()) as BFFResponse<Record<string, unknown>>
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "get calc job failed")
      return normalizeCalJob(json.data ?? {})
    },
    refetchInterval: (query) => {
      const job = query.state.data as CalJob | null | undefined
      if (job && ACTIVE_JOB_STATUSES.includes(job.status)) return 3000
      return false
    },
  })
}

// ---------- trigger ----------

export interface TriggerCalcJobInput {
  period: string
  calculationType: CalculationType
  scope: CalcJobScope
  productSysId?: number
  routeHeadId?: number
  productTypeIdFilter?: number
}

export function useTriggerCalcJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: TriggerCalcJobInput): Promise<CalJob> => {
      const res = await fetch(`/api/v1/finance/calc-jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          period: input.period,
          calculationType: input.calculationType,
          scope: input.scope,
          productSysId: input.productSysId ?? 0,
          routeHeadId: input.routeHeadId ?? 0,
          productTypeIdFilter: input.productTypeIdFilter ?? 0,
        }),
      })
      const json = (await res.json()) as BFFResponse<Record<string, unknown>>
      const data = ensureOK(json)
      return normalizeCalJob((data ?? {}) as Record<string, unknown>)
    },
    onSuccess: (job) => {
      toast.success(`Calc job ${job.jobCode || job.jobId} queued`)
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

// ---------- cancel ----------

export function useCancelCalcJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ jobId, reason }: { jobId: number; reason?: string }): Promise<CalJob> => {
      const res = await fetch(`/api/v1/finance/calc-jobs/${jobId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason ?? "" }),
      })
      const json = (await res.json()) as BFFResponse<Record<string, unknown>>
      const data = ensureOK(json)
      return normalizeCalJob((data ?? {}) as Record<string, unknown>)
    },
    onSuccess: (_data, { jobId }) => {
      toast.success("Calc job cancelled")
      qc.invalidateQueries({ queryKey: KEYS.job(jobId) })
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (err: Error, { jobId }) => {
      // Likely race: job reached terminal status before cancel hit backend.
      // Refresh job state so UI hides the now-stale Cancel button.
      const msg = err.message.includes("state transition")
        ? "Job already finished — refresh to see latest status"
        : err.message
      toast.error(msg)
      qc.invalidateQueries({ queryKey: KEYS.job(jobId) })
    },
  })
}

// ---------- chunks ----------

export interface ListCalcJobChunksResult {
  items: CalJobChunk[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useCalcJobChunks(
  jobId: number | undefined,
  params: ListCalcJobChunksParams = {},
) {
  return useQuery({
    queryKey: KEYS.jobChunks(jobId ?? 0, params),
    enabled: !!jobId,
    queryFn: async (): Promise<ListCalcJobChunksResult> => {
      const qs = new URLSearchParams()
      if (params.waveNo) qs.set("waveNo", String(params.waveNo))
      if (params.status) qs.set("status", params.status)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/calc-jobs/${jobId}/chunks?${qs.toString()}`)
      const json = (await res.json()) as BFFResponse<unknown[]>
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "list chunks failed")
      const items = ((json.data as unknown[]) || []).map((row) =>
        normalizeCalJobChunk(row as Record<string, unknown>),
      )
      const pag = json.pagination
      return {
        items,
        total: Number(pag?.totalItems ?? items.length),
        page: pag?.currentPage ?? 1,
        pageSize: pag?.pageSize ?? items.length,
        totalPages: pag?.totalPages ?? 1,
      }
    },
    staleTime: 15_000,
  })
}

// ---------- products ----------

export interface ListCalcJobProductsResult {
  items: CalJobProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useCalcJobProducts(
  jobId: number | undefined,
  params: ListCalcJobProductsParams = {},
) {
  return useQuery({
    queryKey: KEYS.jobProducts(jobId ?? 0, params),
    enabled: !!jobId,
    queryFn: async (): Promise<ListCalcJobProductsResult> => {
      const qs = new URLSearchParams()
      if (params.status) qs.set("status", params.status)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/calc-jobs/${jobId}/products?${qs.toString()}`)
      const json = (await res.json()) as BFFResponse<unknown[]>
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "list products failed")
      const items = ((json.data as unknown[]) || []).map((row) =>
        normalizeCalJobProduct(row as Record<string, unknown>),
      )
      const pag = json.pagination
      return {
        items,
        total: Number(pag?.totalItems ?? items.length),
        page: pag?.currentPage ?? 1,
        pageSize: pag?.pageSize ?? items.length,
        totalPages: pag?.totalPages ?? 1,
      }
    },
    staleTime: 15_000,
  })
}

// ---------- cost result ----------

export function useCostResult(
  productSysId: number | undefined,
  period: string | undefined,
  calcType: CalculationType | undefined,
) {
  return useQuery({
    queryKey: KEYS.result(productSysId ?? 0, period ?? "", calcType ?? "ACTUAL"),
    enabled: !!productSysId && !!period && !!calcType,
    queryFn: async (): Promise<CostResult | null> => {
      if (!productSysId || !period || !calcType) return null
      const res = await fetch(
        `/api/v1/finance/cost-results/${productSysId}/${period}/${calcType}`,
      )
      const json = (await res.json()) as BFFResponse<Record<string, unknown>>
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "get cost result failed")
      return normalizeCostResult(json.data ?? {})
    },
  })
}

// ---------- breakdown ----------

export function useCostBreakdown(
  productSysId: number | undefined,
  period: string | undefined,
  calcType: CalculationType | undefined,
) {
  return useQuery({
    queryKey: KEYS.breakdown(productSysId ?? 0, period ?? "", calcType ?? "ACTUAL"),
    enabled: !!productSysId && !!period && !!calcType,
    queryFn: async (): Promise<CostBreakdown | null> => {
      if (!productSysId || !period || !calcType) return null
      const res = await fetch(
        `/api/v1/finance/cost-results/${productSysId}/${period}/${calcType}/breakdown`,
      )
      const json = (await res.json()) as BFFResponse<Record<string, unknown>>
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "get breakdown failed")
      return normalizeCostBreakdown(json.data ?? {})
    },
  })
}

// ---------- history ----------

export interface ListCostHistoryResult {
  items: CostHistoryEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useCostHistory(
  productSysId: number | undefined,
  params: ListCostHistoryParams = {},
) {
  return useQuery({
    queryKey: KEYS.history(productSysId ?? 0, params),
    enabled: !!productSysId,
    queryFn: async (): Promise<ListCostHistoryResult> => {
      const qs = new URLSearchParams()
      if (params.calculationType) qs.set("calculationType", params.calculationType)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(
        `/api/v1/finance/cost-results/${productSysId}/history?${qs.toString()}`,
      )
      const json = (await res.json()) as BFFResponse<unknown[]>
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "list history failed")
      const items = ((json.data as unknown[]) || []).map((row) =>
        normalizeCostHistoryEntry(row as Record<string, unknown>),
      )
      const pag = json.pagination
      return {
        items,
        total: Number(pag?.totalItems ?? items.length),
        page: pag?.currentPage ?? 1,
        pageSize: pag?.pageSize ?? items.length,
        totalPages: pag?.totalPages ?? 1,
      }
    },
    staleTime: 30_000,
  })
}

// ---------- verify / approve ----------

export function useVerifyCost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ costId }: { costId: number }): Promise<CostResult> => {
      const res = await fetch(`/api/v1/finance/cost-results/by-id/${costId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
      const json = (await res.json()) as BFFResponse<Record<string, unknown>>
      const data = ensureOK(json)
      return normalizeCostResult((data ?? {}) as Record<string, unknown>)
    },
    onSuccess: () => {
      toast.success("Cost result verified")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export function useApproveCost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ costId }: { costId: number }): Promise<CostResult> => {
      const res = await fetch(`/api/v1/finance/cost-results/by-id/${costId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      })
      const json = (await res.json()) as BFFResponse<Record<string, unknown>>
      const data = ensureOK(json)
      return normalizeCostResult((data ?? {}) as Record<string, unknown>)
    },
    onSuccess: () => {
      toast.success("Cost result approved")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

export const costCalcKeys = KEYS
