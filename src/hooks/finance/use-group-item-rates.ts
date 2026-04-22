"use client"

// Per-item per-stage rates for a given RM group + period

import { useQuery } from "@tanstack/react-query"
import { apiClient, buildQueryString } from "@/lib/api"
import {
  type GetRMGroupItemRatesResponse,
  GetRMGroupItemRatesResponseParser,
} from "@/types/finance/rm-group"

export const groupItemRatesKeys = {
  all: ["finance", "rm-group-item-rates"] as const,
  detail: (groupHeadId: string, period: string) =>
    [...groupItemRatesKeys.all, groupHeadId, period] as const,
}

export function useGroupItemRates(groupHeadId: string, period: string) {
  return useQuery({
    queryKey: groupItemRatesKeys.detail(groupHeadId, period),
    queryFn: async (): Promise<GetRMGroupItemRatesResponse> => {
      const qs = buildQueryString({ period })
      const raw = await apiClient.get<unknown>(
        `/api/v1/finance/rm-groups/${groupHeadId}/item-rates${qs}`
      )
      return GetRMGroupItemRatesResponseParser.fromJSON(raw)
    },
    enabled: !!groupHeadId && !!period,
  })
}
