"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  type CostRoutingRule,
  type CreateCostRoutingRulePayload,
  type ListCostRoutingRulesParams,
  type UpdateCostRoutingRulePayload,
  normalizeCostRoutingRule,
} from "@/types/finance/cost-routing-rule"

const KEYS = {
  all: ["finance", "cost-routing-rule"] as const,
  list: (p: ListCostRoutingRulesParams) => ["finance", "cost-routing-rule", "list", p] as const,
}

export function useRoutingRules(params: ListCostRoutingRulesParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (params.activeFilter) qs.set("activeFilter", params.activeFilter)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/cost-routing-rules?${qs.toString()}`)
      const json = await res.json()
      return {
        items: ((json.data as unknown[]) || []).map((r) => normalizeCostRoutingRule(r as Record<string, unknown>)),
        pagination: json.pagination,
      }
    },
  })
}

export function useCreateRoutingRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateCostRoutingRulePayload) => {
      const res = await fetch("/api/v1/finance/cost-routing-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostRoutingRule(json.data)
    },
    onSuccess: () => {
      toast.success("Routing rule created")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateRoutingRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { ruleId: number } & UpdateCostRoutingRulePayload) => {
      const { ruleId, ...rest } = input
      const res = await fetch(`/api/v1/finance/cost-routing-rules/${ruleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostRoutingRule(json.data)
    },
    onSuccess: () => {
      toast.success("Routing rule updated")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteRoutingRule() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ruleId: number) => {
      const res = await fetch(`/api/v1/finance/cost-routing-rules/${ruleId}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return ruleId
    },
    onSuccess: () => {
      toast.success("Rule deleted")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export type { CostRoutingRule }
export const costRoutingRuleKeys = KEYS
