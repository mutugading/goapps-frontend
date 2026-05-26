"use client"

// BI chart-data hook — drives the viewer page. Polling interval comes from the
// dashboard's refresh_interval_sec (or cache_ttl_sec fallback).

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api"
import type { ChartDataResponse, GetDashboardDataResponse, ViewerState } from "@/types/bi"
import { GetDashboardDataResponseParser } from "@/types/bi"
import { dashboardKeys } from "./use-dashboard"

/** Build the query string for the chart-data BFF route from viewer state. */
function buildDataQuery(state: ViewerState): string {
  const params = new URLSearchParams()
  params.set("period", state.period)
  if (state.period === "CUSTOM") {
    if (state.periodFrom) params.set("periodFrom", state.periodFrom)
    if (state.periodTo) params.set("periodTo", state.periodTo)
  }
  params.set("compare", state.compare)
  if (state.drillPath.length > 0) params.set("drill_path", state.drillPath.join(","))
  return params.toString()
}

/**
 * useDashboardData fetches the shaped chart payload for the viewer.
 *
 * @param code dashboard code
 * @param state viewer filter/drill state (synced to URL upstream)
 * @param refreshIntervalMs polling interval; 0 disables polling
 */
export function useDashboardData(code: string | undefined, state: ViewerState, refreshIntervalMs: number) {
  return useQuery<ChartDataResponse | undefined>({
    queryKey: [...dashboardKeys.all, "data", code, state] as const,
    queryFn: async () => {
      const qs = buildDataQuery(state)
      const raw = await apiClient.get<unknown>(`/api/v1/finance/bi/dashboards/${code}/data?${qs}`)
      const parsed: GetDashboardDataResponse = GetDashboardDataResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to load chart data")
      return parsed.data
    },
    enabled: Boolean(code),
    refetchInterval: refreshIntervalMs > 0 ? refreshIntervalMs : false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  })
}
