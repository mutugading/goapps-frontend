"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  normalizeRequiredEntry,
  normalizeMissingParam,
  normalizeAvailable,
  type AvailableParamEntry,
  type MissingParam,
  type RequiredParamEntry,
  type UpsertParamValuePayload,
} from "@/types/finance/cost-product-parameter"

const cppKeys = {
  all: ["finance", "cost-product-parameter"] as const,
  product: (productSysId: number) =>
    ["finance", "cost-product-parameter", "product", productSysId] as const,
  missing: (productSysId: number) =>
    ["finance", "cost-product-parameter", "missing", productSysId] as const,
  available: (productSysId: number) =>
    ["finance", "cost-product-parameter", "available", productSysId] as const,
}

export function useProductRequiredParams(productSysId: number, requiredOnly = false) {
  return useQuery({
    queryKey: [...cppKeys.product(productSysId), { requiredOnly }],
    enabled: productSysId > 0,
    queryFn: async (): Promise<RequiredParamEntry[]> => {
      const qs = new URLSearchParams({ requiredOnly: String(requiredOnly) }).toString()
      const res = await fetch(`/api/v1/finance/cost-product-parameters/products/${productSysId}?${qs}`)
      if (!res.ok) throw new Error("Failed to load product params")
      const body = await res.json()
      return ((body.data ?? []) as Array<Record<string, unknown>>).map(normalizeRequiredEntry)
    },
    staleTime: 30_000,
  })
}

export function useMissingRequiredParams(productSysId: number) {
  return useQuery({
    queryKey: cppKeys.missing(productSysId),
    enabled: productSysId > 0,
    queryFn: async (): Promise<MissingParam[]> => {
      const res = await fetch(`/api/v1/finance/cost-product-parameters/products/${productSysId}/missing`)
      if (!res.ok) throw new Error("Failed")
      const body = await res.json()
      return ((body.data ?? []) as Array<Record<string, unknown>>).map(normalizeMissingParam)
    },
    staleTime: 30_000,
  })
}

interface BatchUpsertResult {
  upsertedCount: number
  failedCount: number
  failedParamCodes: string[]
}

export function useAvailableParams(productSysId: number) {
  return useQuery({
    queryKey: cppKeys.available(productSysId),
    enabled: productSysId > 0,
    queryFn: async (): Promise<AvailableParamEntry[]> => {
      const res = await fetch(`/api/v1/finance/cost-product-parameters/products/${productSysId}/available`)
      if (!res.ok) throw new Error("Failed to load available params")
      const body = await res.json()
      return ((body.data ?? []) as Array<Record<string, unknown>>).map(normalizeAvailable)
    },
    staleTime: 30_000,
  })
}

export function useAddApplicableParam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      productSysId: number
      paramId: string
      isRequired: boolean
      displayOrder?: number
    }) => {
      const res = await fetch(`/api/v1/finance/cost-product-parameters/applicable/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      if (!res.ok || body?.base?.isSuccess === false) {
        throw new Error(body?.base?.message || "Failed to add parameter")
      }
    },
    onSuccess: (_data, vars) => {
      toast.success("Parameter added")
      qc.invalidateQueries({ queryKey: cppKeys.product(vars.productSysId) })
      qc.invalidateQueries({ queryKey: cppKeys.missing(vars.productSysId) })
      qc.invalidateQueries({ queryKey: cppKeys.available(vars.productSysId) })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to add parameter")
    },
  })
}

export function useRemoveApplicableParam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { productSysId: number; paramId: string }) => {
      const res = await fetch(`/api/v1/finance/cost-product-parameters/applicable/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      if (!res.ok || body?.base?.isSuccess === false) {
        throw new Error(body?.base?.message || "Failed to remove parameter")
      }
    },
    onSuccess: (_data, vars) => {
      toast.success("Parameter removed")
      qc.invalidateQueries({ queryKey: cppKeys.product(vars.productSysId) })
      qc.invalidateQueries({ queryKey: cppKeys.missing(vars.productSysId) })
      qc.invalidateQueries({ queryKey: cppKeys.available(vars.productSysId) })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to remove parameter")
    },
  })
}

export function useUpdateApplicableParam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      productSysId: number
      paramId: string
      isRequired?: boolean
      displayOrder?: number
    }) => {
      const res = await fetch(`/api/v1/finance/cost-product-parameters/applicable/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const body = await res.json()
      if (!res.ok || body?.base?.isSuccess === false) {
        throw new Error(body?.base?.message || "Failed to update")
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: cppKeys.product(vars.productSysId) })
      qc.invalidateQueries({ queryKey: cppKeys.missing(vars.productSysId) })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    },
  })
}

export function useUpsertProductParamValuesBatch() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      productSysId,
      values,
    }: {
      productSysId: number
      values: UpsertParamValuePayload[]
    }): Promise<BatchUpsertResult> => {
      const res = await fetch(`/api/v1/finance/cost-product-parameters/upsert-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSysId, values }),
      })
      const body = await res.json()
      if (!res.ok || body?.base?.isSuccess === false) {
        throw new Error(body?.base?.message || "Failed to save parameter values")
      }
      return {
        upsertedCount: Number(body.upsertedCount ?? 0),
        failedCount: Number(body.failedCount ?? 0),
        failedParamCodes: (body.failedParamCodes as string[]) ?? [],
      }
    },
    onSuccess: (data, vars) => {
      if (data.failedCount > 0) {
        toast.warning(`Saved ${data.upsertedCount}; ${data.failedCount} failed`)
      } else {
        toast.success(`Saved ${data.upsertedCount} parameter values`)
      }
      qc.invalidateQueries({ queryKey: cppKeys.product(vars.productSysId) })
      qc.invalidateQueries({ queryKey: cppKeys.missing(vars.productSysId) })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Failed to save"
      toast.error(msg)
    },
  })
}
