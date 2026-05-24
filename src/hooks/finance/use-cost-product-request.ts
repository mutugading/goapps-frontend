"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  type ClosedSubstatus,
  type CostProductRequest,
  type CreateCostProductRequestPayload,
  type ListCostProductRequestsParams,
  type ProductClassification,
  type UpdateCostProductRequestPayload,
  normalizeCostProductRequest,
} from "@/types/finance/cost-product-request"

const KEYS = {
  all: ["finance", "cost-product-request"] as const,
  list: (p: ListCostProductRequestsParams) => ["finance", "cost-product-request", "list", p] as const,
  detail: (id: number) => ["finance", "cost-product-request", "detail", id] as const,
}

async function postJson(url: string, body?: unknown): Promise<{ data: CostProductRequest | null }> {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
  return { data: json.data ? normalizeCostProductRequest(json.data) : null }
}

export function useCostProductRequests(params: ListCostProductRequestsParams) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (params.search) qs.set("search", params.search)
      if (params.status) qs.set("status", params.status)
      if (params.requestTypeId) qs.set("requestTypeId", String(params.requestTypeId))
      if (params.requesterUserId) qs.set("requesterUserId", params.requesterUserId)
      if (params.assigneeUserId) qs.set("assigneeUserId", params.assigneeUserId)
      if (params.sortBy) qs.set("sortBy", params.sortBy)
      if (params.sortOrder) qs.set("sortOrder", params.sortOrder)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/cost-product-requests?${qs.toString()}`)
      const json = await res.json()
      return {
        items: ((json.data as unknown[]) || []).map((r) => normalizeCostProductRequest(r as Parameters<typeof normalizeCostProductRequest>[0])),
        pagination: json.pagination,
      }
    },
    staleTime: 30_000,
  })
}

export function useCostProductRequest(requestId: number | undefined) {
  return useQuery({
    queryKey: KEYS.detail(requestId ?? 0),
    queryFn: async () => {
      if (!requestId) return null
      const res = await fetch(`/api/v1/finance/cost-product-requests/${requestId}`)
      const json = await res.json()
      return json.data ? normalizeCostProductRequest(json.data) : null
    },
    enabled: !!requestId,
  })
}

export function useCreateCostProductRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateCostProductRequestPayload) => {
      const res = await fetch("/api/v1/finance/cost-product-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostProductRequest(json.data)
    },
    onSuccess: (r) => {
      toast.success(`Request ${r.requestNo} created`)
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateCostProductRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { requestId: number } & UpdateCostProductRequestPayload) => {
      const { requestId, ...payload } = input
      const res = await fetch(`/api/v1/finance/cost-product-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostProductRequest(json.data)
    },
    onSuccess: () => {
      toast.success("Request updated")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// =============================================================================
// State transitions — one mutation each.
// =============================================================================

function makeTransition(slug: string, successMsg: string) {
  return function useTransition() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (input: { requestId: number; body?: Record<string, unknown> }) => {
        const result = await postJson(`/api/v1/finance/cost-product-requests/${input.requestId}/${slug}`, input.body)
        return result.data
      },
      onSuccess: () => {
        toast.success(successMsg)
        qc.invalidateQueries({ queryKey: KEYS.all })
      },
      onError: (e: Error) => toast.error(e.message),
    })
  }
}

export const useSubmitRequest = makeTransition("submit", "Submitted")
export const useStartReview = makeTransition("start-review", "Review started")
export const useUseExistingCosting = makeTransition("use-existing-costing", "Marked quote-ready")
export const useReviseRequest = makeTransition("revise", "Revised; back to SUBMITTED")
export const useReopenRequest = makeTransition("reopen", "Reopened; back to DRAFT")
export const useRejectRequest = makeTransition("reject", "Rejected")
export const useCancelRequest = makeTransition("cancel", "Cancelled")
export const useMarkParameterComplete = makeTransition(
  "mark-parameter-complete",
  "Marked PARAMETER_COMPLETE",
)

// Hooks with structured payloads.
export function useVerifyClassification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { requestId: number; verifiedClassification: ProductClassification; overrideReason?: string }) => {
      const result = await postJson(`/api/v1/finance/cost-product-requests/${input.requestId}/verify-classification`, {
        verifiedClassification: input.verifiedClassification,
        overrideReason: input.overrideReason || "",
      })
      return result.data
    },
    onSuccess: () => {
      toast.success("Classification verified")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDecideFeasibility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { requestId: number; decision: "FEASIBLE" | "NOT_FEASIBLE"; note?: string }) => {
      const result = await postJson(`/api/v1/finance/cost-product-requests/${input.requestId}/decide-feasibility`, {
        decision: input.decision,
        note: input.note || "",
      })
      return result.data
    },
    onSuccess: () => {
      toast.success("Feasibility decided")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useCloseRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { requestId: number; closedSubstatus: ClosedSubstatus }) => {
      const result = await postJson(`/api/v1/finance/cost-product-requests/${input.requestId}/close`, {
        closedSubstatus: input.closedSubstatus,
      })
      return result.data
    },
    onSuccess: () => {
      toast.success("Closed")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useAssignRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { requestId: number; assigneeUserId: string }) => {
      const result = await postJson(`/api/v1/finance/cost-product-requests/${input.requestId}/assign`, {
        assigneeUserId: input.assigneeUserId,
      })
      return result.data
    },
    onSuccess: () => {
      toast.success("Assigned")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const costProductRequestKeys = KEYS
