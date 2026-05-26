"use client"

import { useQuery } from "@tanstack/react-query"
import { normalizeCostPaperTubeType } from "@/types/finance/cost-paper-tube-type"

export function useCostPaperTubeTypes() {
  return useQuery({
    queryKey: ["finance", "cost-paper-tube-type", "list"] as const,
    queryFn: async () => {
      const res = await fetch("/api/v1/finance/cost-paper-tube-types?activeFilter=active&pageSize=50")
      const json = await res.json()
      return ((json.data as unknown[]) || []).map((r) => normalizeCostPaperTubeType(r as Record<string, unknown>))
    },
    staleTime: 5 * 60_000,
  })
}
