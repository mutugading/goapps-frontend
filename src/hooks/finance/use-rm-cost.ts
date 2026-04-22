"use client"

// RM Cost list / get / history hooks

import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type ListRMCostsParams,
  type ListRMCostHistoryParams,
  type ListRMCostsResponse,
  type GetRMCostResponse,
  type ListRMCostHistoryResponse,
  type ExportRMCostsResponse,
  ListRMCostsResponseParser,
  GetRMCostResponseParser,
  ListRMCostHistoryResponseParser,
  ListRMCostPeriodsResponseParser,
  ExportRMCostsResponseParser,
} from "@/types/finance/rm-cost"

export interface ExportRMCostsParams {
  period?: string
  rmType?: number
  groupHeadId?: string
  search?: string
}

export const rmCostKeys = {
  all: ["finance", "rm-cost"] as const,
  lists: () => [...rmCostKeys.all, "list"] as const,
  list: (params: ListRMCostsParams) => [...rmCostKeys.lists(), params] as const,
  details: () => [...rmCostKeys.all, "detail"] as const,
  detail: (period: string, rmCode: string) => [...rmCostKeys.details(), period, rmCode] as const,
  histories: () => [...rmCostKeys.all, "history"] as const,
  history: (params: ListRMCostHistoryParams) => [...rmCostKeys.histories(), params] as const,
  periods: () => [...rmCostKeys.all, "periods"] as const,
}

export function useRMCostPeriods() {
  return useQuery({
    queryKey: rmCostKeys.periods(),
    queryFn: async (): Promise<{ periods: string[] }> => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/rm-costs/periods`)
      const parsed = ListRMCostPeriodsResponseParser.fromJSON(raw)
      return { periods: parsed.periods || [] }
    },
    staleTime: 30_000,
  })
}

export function useRMCosts(params: ListRMCostsParams = {}) {
  return useQuery({
    queryKey: rmCostKeys.list(params),
    queryFn: async (): Promise<ListRMCostsResponse> => {
      const qs = buildQueryString(params as Record<string, unknown>)
      const raw = await apiClient.get<unknown>(`/api/v1/finance/rm-costs${qs}`)
      return ListRMCostsResponseParser.fromJSON(raw)
    },
  })
}

export function useRMCost(period: string, rmCode: string, enabled = true) {
  return useQuery({
    queryKey: rmCostKeys.detail(period, rmCode),
    queryFn: async (): Promise<GetRMCostResponse> => {
      const raw = await apiClient.get<unknown>(
        `/api/v1/finance/rm-costs/${period}/${encodeURIComponent(rmCode)}`
      )
      return GetRMCostResponseParser.fromJSON(raw)
    },
    enabled: enabled && !!period && !!rmCode,
  })
}

export function useExportRMCosts() {
  return useMutation({
    mutationFn: async (params: ExportRMCostsParams = {}): Promise<ExportRMCostsResponse> => {
      const qs = buildQueryString(params as Record<string, unknown>)
      const raw = await apiClient.get<unknown>(`/api/v1/finance/rm-costs/export${qs}`)
      return ExportRMCostsResponseParser.fromJSON(raw)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "rm-costs-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export RM Costs")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export RM Costs")
    },
  })
}

export function useRMCostHistory(params: ListRMCostHistoryParams = {}) {
  return useQuery({
    queryKey: rmCostKeys.history(params),
    queryFn: async (): Promise<ListRMCostHistoryResponse> => {
      const qs = buildQueryString(params as Record<string, unknown>)
      const raw = await apiClient.get<unknown>(`/api/v1/finance/rm-costs/history${qs}`)
      return ListRMCostHistoryResponseParser.fromJSON(raw)
    },
  })
}
