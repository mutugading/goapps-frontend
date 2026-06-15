"use client"

import { useQuery } from "@tanstack/react-query"

import { normalizeParamSummary, type ParamSummaryData } from "@/types/finance/param-summary"

async function fetchParamSummary(requestId: number): Promise<ParamSummaryData> {
  const res = await fetch(`/api/v1/finance/cost-product-requests/${requestId}/param-summary`)
  if (!res.ok) throw new Error("Failed to fetch param summary")
  const json = (await res.json()) as Record<string, unknown>
  if (!(json.base as Record<string, unknown>)?.isSuccess) {
    throw new Error(
      String((json.base as Record<string, unknown>)?.message ?? "Failed to fetch param summary"),
    )
  }
  return normalizeParamSummary(json)
}

export function useParamSummary(requestId: number | undefined) {
  return useQuery({
    queryKey: ["finance", "cost-product-request", requestId, "param-summary"],
    queryFn: () => fetchParamSummary(requestId!),
    enabled: !!requestId && requestId > 0,
    staleTime: 30_000,
  })
}
