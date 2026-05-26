"use client"

// BI preview hook — admin wizard live preview of an unsaved dashboard config.

import { useMutation } from "@tanstack/react-query"

import { apiClient } from "@/lib/api"
import type { ChartDataResponse, PreviewDashboardRequest, PreviewDashboardResponse } from "@/types/bi"
import { PreviewDashboardResponseParser } from "@/types/bi"

/** usePreviewDashboard renders a transient config against real fact data (no cache). */
export function usePreviewDashboard() {
  return useMutation<ChartDataResponse | undefined, Error, PreviewDashboardRequest>({
    mutationFn: async (req) => {
      const raw = await apiClient.post<unknown>("/api/v1/finance/bi/preview", req)
      const parsed: PreviewDashboardResponse = PreviewDashboardResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Preview failed")
      return parsed.data
    },
  })
}
