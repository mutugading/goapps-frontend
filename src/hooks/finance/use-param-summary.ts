"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { normalizeParamSummary, type ParamSummaryData } from "@/types/finance/param-summary"

async function fetchParamSummary(requestId: number): Promise<ParamSummaryData> {
  const res = await fetch(`/api/v1/finance/cost-product-requests/${requestId}/param-summary`)
  if (!res.ok) throw new Error("Failed to fetch param summary")
  const json = (await res.json()) as Record<string, unknown>
  if (!(json.base as Record<string, unknown>)?.isSuccess) {
    throw new Error(
      String((json.base as Record<string, unknown>)?.message ?? "Failed to fetch param summary"),
    )
  }
  return normalizeParamSummary(json)
}

export function useParamSummary(requestId: number | undefined) {
  return useQuery({
    queryKey: ["finance", "cost-product-request", requestId, "param-summary"],
    queryFn: () => fetchParamSummary(requestId!),
    enabled: !!requestId && requestId > 0,
    staleTime: 30_000,
  })
}

// ---------- Override mutation ----------

interface OverrideValueInput {
  productSysId: number
  paramId: string
  valueNumeric?: string
  valueText?: string
  valueFlag?: boolean
  hasValueFlag?: boolean
}

interface OverrideParamValuesPayload {
  requestId: number
  routeLevel: number
  values: OverrideValueInput[]
}

async function overrideParamValues(payload: OverrideParamValuesPayload): Promise<number> {
  const res = await fetch(
    `/api/v1/finance/cost-product-requests/${payload.requestId}/params/override`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeLevel: payload.routeLevel, values: payload.values }),
    },
  )
  const json = (await res.json()) as Record<string, unknown>
  const base = json.base as Record<string, unknown> | undefined
  if (!base?.isSuccess) {
    throw new Error(String(base?.message ?? "Failed to override param values"))
  }
  return Number(json.updatedCount ?? 0)
}

export function useOverrideParamValues(requestId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<OverrideParamValuesPayload, "requestId">) =>
      overrideParamValues({ requestId, ...payload }),
    onSuccess: (count) => {
      toast.success(`${count} param value${count !== 1 ? "s" : ""} updated`)
      void queryClient.invalidateQueries({
        queryKey: ["finance", "cost-product-request", requestId, "param-summary"],
      })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

// ---------- Param edit log ----------

export interface ParamEditLogEntry {
  paramCode: string
  oldValue: string
  newValue: string
  changedBy: string
  changedAt: string
}

async function fetchParamEditLog(
  requestId: number,
  routeLevel: number,
): Promise<ParamEditLogEntry[]> {
  const res = await fetch(
    `/api/v1/finance/cost-product-requests/${requestId}/params/edit-log?level=${routeLevel}`,
  )
  if (!res.ok) throw new Error("Failed to fetch edit log")
  const json = (await res.json()) as Record<string, unknown>
  const base = json.base as Record<string, unknown> | undefined
  if (!base?.isSuccess) {
    throw new Error(String(base?.message ?? "Failed to fetch edit log"))
  }
  const entries = (json.entries as Record<string, unknown>[] | undefined) ?? []
  return entries.map((e) => ({
    paramCode: String(e.paramCode ?? e.param_code ?? ""),
    oldValue: String(e.oldValue ?? e.old_value ?? ""),
    newValue: String(e.newValue ?? e.new_value ?? ""),
    changedBy: String(e.changedBy ?? e.changed_by ?? ""),
    changedAt: String(e.changedAt ?? e.changed_at ?? ""),
  }))
}

export function useParamEditLog(requestId: number | undefined, routeLevel: number | undefined) {
  return useQuery({
    queryKey: ["finance", "cost-product-request", requestId, "param-edit-log", routeLevel],
    queryFn: () => fetchParamEditLog(requestId!, routeLevel!),
    enabled: !!requestId && requestId > 0 && !!routeLevel && routeLevel > 0,
    staleTime: 30_000,
  })
}
