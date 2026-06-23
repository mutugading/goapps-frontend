"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  type CostErpItem,
  type CreateErpItemForm,
  type ListErpItemsParams,
  type ListErpLookupParams,
  type UpdateErpItemForm,
  normalizeErpGrade,
  normalizeErpItem,
  normalizeErpShade,
} from "@/types/finance/cost-erp"

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  items: (p: ListErpItemsParams) => ["finance", "cost-erp", "items", p] as const,
  itemsAll: () => ["finance", "cost-erp", "items"] as const,
  grades: (p: ListErpLookupParams) => ["finance", "cost-erp", "grades", p] as const,
  shades: (p: ListErpLookupParams) => ["finance", "cost-erp", "shades", p] as const,
}

// ---------------------------------------------------------------------------
// List hooks
// ---------------------------------------------------------------------------

export function useErpItems(params: ListErpItemsParams = {}) {
  return useQuery({
    queryKey: KEYS.items(params),
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (params.search) qs.set("search", params.search)
      if (params.itemType) qs.set("itemType", params.itemType)
      if (params.activeFilter) qs.set("activeFilter", params.activeFilter)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/cost-erp/items?${qs.toString()}`)
      const json = await res.json()
      return {
        items: ((json.data as unknown[]) || []).map((r) =>
          normalizeErpItem(r as Parameters<typeof normalizeErpItem>[0]),
        ),
        pagination: json.pagination,
      }
    },
    staleTime: 5 * 60_000,
  })
}

export function useErpGrades(params: ListErpLookupParams = {}) {
  return useQuery({
    queryKey: KEYS.grades(params),
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (params.search) qs.set("search", params.search)
      if (params.activeFilter) qs.set("activeFilter", params.activeFilter)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/cost-erp/grades?${qs.toString()}`)
      const json = await res.json()
      return {
        items: ((json.data as unknown[]) || []).map((r) =>
          normalizeErpGrade(r as Parameters<typeof normalizeErpGrade>[0]),
        ),
        pagination: json.pagination,
      }
    },
    staleTime: 5 * 60_000,
  })
}

export function useErpShades(params: ListErpLookupParams = {}) {
  return useQuery({
    queryKey: KEYS.shades(params),
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (params.search) qs.set("search", params.search)
      if (params.activeFilter) qs.set("activeFilter", params.activeFilter)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/cost-erp/shades?${qs.toString()}`)
      const json = await res.json()
      return {
        items: ((json.data as unknown[]) || []).map((r) =>
          normalizeErpShade(r as Parameters<typeof normalizeErpShade>[0]),
        ),
        pagination: json.pagination,
      }
    },
    staleTime: 5 * 60_000,
  })
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useCreateErpItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateErpItemForm): Promise<CostErpItem> => {
      const res = await fetch("/api/v1/finance/cost-erp/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) {
        throw new Error(json.base?.message || "Failed to create ERP item")
      }
      return normalizeErpItem(json.data as Parameters<typeof normalizeErpItem>[0])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.itemsAll() })
      toast.success("ERP item created successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create ERP item")
    },
  })
}

export function useUpdateErpItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      itemId: number
      data: UpdateErpItemForm
    }): Promise<CostErpItem> => {
      const res = await fetch(`/api/v1/finance/cost-erp/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) {
        throw new Error(json.base?.message || "Failed to update ERP item")
      }
      return normalizeErpItem(json.data as Parameters<typeof normalizeErpItem>[0])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.itemsAll() })
      toast.success("ERP item updated successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ERP item")
    },
  })
}

export function useDeleteErpItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: number): Promise<void> => {
      const res = await fetch(`/api/v1/finance/cost-erp/items/${itemId}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!json.base?.isSuccess) {
        throw new Error(json.base?.message || "Failed to delete ERP item")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.itemsAll() })
      toast.success("ERP item deleted successfully")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete ERP item")
    },
  })
}
