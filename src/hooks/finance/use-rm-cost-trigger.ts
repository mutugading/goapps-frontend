"use client"

// RM Cost trigger hook - enqueues async recalculation

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"
import {
  type TriggerRMCostParams,
  type TriggerRMCostCalculationResponse,
  TriggerRMCostCalculationResponseParser,
  RMCostTriggerReason,
} from "@/types/finance/rm-cost"
import { rmCostKeys } from "./use-rm-cost"

export function useTriggerRMCost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: TriggerRMCostParams): Promise<TriggerRMCostCalculationResponse> => {
      const raw = await apiClient.post<unknown>("/api/v1/finance/rm-costs/trigger", {
        period: params.period,
        groupHeadId: params.groupHeadId,
        triggerReason: params.triggerReason ?? RMCostTriggerReason.RM_COST_TRIGGER_REASON_MANUAL_UI,
      })
      return TriggerRMCostCalculationResponseParser.fromJSON(raw)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: rmCostKeys.all })
      if (response.base?.isSuccess) {
        toast.success(`Recalculation queued (job ${response.jobId.slice(0, 8)}…)`)
      } else {
        toast.error(response.base?.message || "Failed to queue recalculation")
      }
    },
    onError: (err: Error) => toast.error(err.message || "Failed to queue recalculation"),
  })
}
