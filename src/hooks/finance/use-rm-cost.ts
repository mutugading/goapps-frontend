"use client"

// RM Cost list / get / history hooks

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type ListRMCostsParams,
  type ListRMCostHistoryParams,
  type ListRMCostsResponse,
  type GetRMCostResponse,
  type ListRMCostHistoryResponse,
  type ExportRMCostsResponse,
  type ListCostDetailsResponse,
  type UpdateRMCostInputsResponse,
  type UpdateCostDetailFixRateResponse,
  type UpdateRMCostInputsParams,
  type UpdateCostDetailFixRateParams,
  ListRMCostsResponseParser,
  GetRMCostResponseParser,
  ListRMCostHistoryResponseParser,
  ListRMCostPeriodsResponseParser,
  ExportRMCostsResponseParser,
  ListCostDetailsResponseParser,
  UpdateRMCostInputsResponseParser,
  UpdateCostDetailFixRateResponseParser,
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
  costDetails: (rmCostId: string) => [...rmCostKeys.all, "cost-details", rmCostId] as const,
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

// =============================================================================
// V2 hooks
// =============================================================================

// useCostDetails fetches per-(item, grade) snapshots for one cost row.
export function useCostDetails(rmCostId: string, enabled = true) {
  return useQuery({
    queryKey: rmCostKeys.costDetails(rmCostId),
    queryFn: async (): Promise<ListCostDetailsResponse> => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/rm-costs/by-id/${rmCostId}/details`)
      return ListCostDetailsResponseParser.fromJSON(raw)
    },
    enabled: enabled && !!rmCostId,
  })
}

// useUpdateRMCostInputs edits marketing snapshot / simulation_rate / flags
// inline. Recomputes cost_mark + cost_sim only (no per-detail recalc).
export function useUpdateRMCostInputs() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: UpdateRMCostInputsParams): Promise<UpdateRMCostInputsResponse> => {
      const { rmCostId, ...body } = params
      const raw = await apiClient.put<unknown>(
        `/api/v1/finance/rm-costs/by-id/${rmCostId}/inputs`,
        body,
      )
      return UpdateRMCostInputsResponseParser.fromJSON(raw)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess) {
        queryClient.invalidateQueries({ queryKey: rmCostKeys.all })
        toast.success("RM Cost inputs updated")
      } else {
        toast.error(response.base?.message || "Failed to update inputs")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update inputs")
    },
  })
}

// useUpdateCostDetailFixRate edits one detail row's fix_rate. Recomputes the
// FL chain on that detail and the parent fl_rate (= MAX). Updates cost_val
// when the parent's valuation_flag is AUTO or FL.
export function useUpdateCostDetailFixRate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: UpdateCostDetailFixRateParams): Promise<UpdateCostDetailFixRateResponse> => {
      const { costDetailId, fixRate } = params
      const raw = await apiClient.put<unknown>(
        `/api/v1/finance/rm-costs/details/${costDetailId}/fix-rate`,
        { fixRate },
      )
      return UpdateCostDetailFixRateResponseParser.fromJSON(raw)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess) {
        queryClient.invalidateQueries({ queryKey: rmCostKeys.all })
        toast.success("Fix rate updated")
      } else {
        toast.error(response.base?.message || "Failed to update fix rate")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update fix rate")
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
