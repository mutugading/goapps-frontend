"use client"

import { useQuery } from "@tanstack/react-query"
import { normalizeCostRequestType } from "@/types/finance/cost-request-type"

export function useCostRequestTypes() {
  return useQuery({
    queryKey: ["finance", "cost-request-type", "list"] as const,
    queryFn: async () => {
      const res = await fetch("/api/v1/finance/cost-request-types?activeFilter=active&pageSize=50")
      const json = await res.json()
      return ((json.data as unknown[]) || []).map((r) => normalizeCostRequestType(r as Record<string, unknown>))
    },
    staleTime: 5 * 60_000,
  })
}
