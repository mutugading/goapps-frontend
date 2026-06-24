"use client"

import { useQuery } from "@tanstack/react-query"

import {
  type ListErpItemsParams,
  type ListErpLookupParams,
  normalizeErpGrade,
  normalizeErpItem,
  normalizeErpShade,
} from "@/types/finance/cost-erp"

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

const KEYS = {
  items: (p: ListErpItemsParams) => ["finance", "cost-erp", "items", p] as const,
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
