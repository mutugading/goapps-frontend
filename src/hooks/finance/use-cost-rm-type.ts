"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  type CostRmType,
  type ListCostRmTypesParams,
  type ReferenceTarget,
  normalizeCostRmType,
} from "@/types/finance/cost-rm-type"

const KEYS = {
  all: ["finance", "cost-rm-type"] as const,
  list: (params: ListCostRmTypesParams) => ["finance", "cost-rm-type", "list", params] as const,
  detail: (id: number) => ["finance", "cost-rm-type", "detail", id] as const,
}

async function fetchList(params: ListCostRmTypesParams) {
  const qs = new URLSearchParams()
  if (params.search) qs.set("search", params.search)
  if (params.referenceTarget) qs.set("referenceTarget", params.referenceTarget)
  if (params.activeFilter) qs.set("activeFilter", params.activeFilter)
  if (params.page) qs.set("page", String(params.page))
  if (params.pageSize) qs.set("pageSize", String(params.pageSize))
  const res = await fetch(`/api/v1/finance/cost-rm-types?${qs.toString()}`)
  const json = await res.json()
  return {
    items: ((json.data as unknown[]) || []).map((r) =>
      normalizeCostRmType(r as Parameters<typeof normalizeCostRmType>[0]),
    ),
    pagination: json.pagination,
    base: json.base,
  }
}

export function useCostRmTypes(params: ListCostRmTypesParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => fetchList(params),
    staleTime: 60_000,
  })
}

export function useCostRmType(typeId: number | undefined) {
  return useQuery({
    queryKey: KEYS.detail(typeId ?? 0),
    queryFn: async (): Promise<CostRmType | null> => {
      if (!typeId) return null
      const res = await fetch(`/api/v1/finance/cost-rm-types/${typeId}`)
      const json = await res.json()
      return json.data ? normalizeCostRmType(json.data) : null
    },
    enabled: !!typeId,
  })
}

export function useCreateCostRmType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      typeCode: string
      typeName: string
      referenceTarget: ReferenceTarget
      allowSubSequence: boolean
    }) => {
      const res = await fetch("/api/v1/finance/cost-rm-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostRmType(json.data)
    },
    onSuccess: () => {
      toast.success("RM type created")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateCostRmType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { typeId: number; typeName: string; isActive: boolean }) => {
      const res = await fetch(`/api/v1/finance/cost-rm-types/${payload.typeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typeName: payload.typeName, isActive: payload.isActive }),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostRmType(json.data)
    },
    onSuccess: () => {
      toast.success("RM type updated")
      qc.invalidateQueries({ queryKey: KEYS.all })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const costRmTypeKeys = KEYS
