"use client"

// BI fact-distincts hook — powers admin form dropdowns (type → group_1 → group_2 → group_3).

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api"
import type { FactMetricDistinct, GetFactDistinctsResponse } from "@/types/bi"
import { GetFactDistinctsResponseParser } from "@/types/bi"
import type { ListDataSourcesResponse, DataSource } from "@/types/bi"
import { ListDataSourcesResponseParser } from "@/types/bi"

export const factKeys = {
  all: ["finance", "bi-fact"] as const,
  distincts: (type: string) => [...factKeys.all, "distincts", type] as const,
}

/**
 * useFactDistincts returns distinct type/group values for the given type scope.
 * Pass an empty string to get just the list of types.
 */
export function useFactDistincts(type = "") {
  return useQuery<FactMetricDistinct | undefined>({
    queryKey: factKeys.distincts(type),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/bi/fact/distincts?type=${encodeURIComponent(type)}`)
      const parsed: GetFactDistinctsResponse = GetFactDistinctsResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to load distinct values")
      return parsed.data
    },
    staleTime: 300_000, // 5 min — distincts change rarely
  })
}

/** useDataSources lists the data-source registry. */
export function useDataSources(includeInactive = false) {
  return useQuery<DataSource[]>({
    queryKey: ["finance", "bi-data-source", "list", includeInactive] as const,
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/bi/data-sources?includeInactive=${includeInactive}`)
      const parsed: ListDataSourcesResponse = ListDataSourcesResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to list data sources")
      return parsed.data
    },
    staleTime: 300_000,
  })
}
