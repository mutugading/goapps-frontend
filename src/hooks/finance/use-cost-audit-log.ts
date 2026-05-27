"use client"

import { useQuery } from "@tanstack/react-query"

import { type ListCostAuditLogsParams, normalizeCostAuditLog } from "@/types/finance/cost-audit-log"

export function useAuditLogs(params: ListCostAuditLogsParams) {
  return useQuery({
    queryKey: ["finance", "cost-audit-log", "list", params] as const,
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (params.entityType) qs.set("entityType", params.entityType)
      if (params.entityId) qs.set("entityId", String(params.entityId))
      if (params.userId) qs.set("userId", params.userId)
      if (params.operation) qs.set("operation", params.operation)
      if (params.fromDate) qs.set("fromDate", params.fromDate)
      if (params.toDate) qs.set("toDate", params.toDate)
      if (params.page) qs.set("page", String(params.page))
      if (params.pageSize) qs.set("pageSize", String(params.pageSize))
      const res = await fetch(`/api/v1/finance/cost-audit-logs?${qs.toString()}`)
      const json = await res.json()
      return {
        items: ((json.data as unknown[]) || []).map((r) => normalizeCostAuditLog(r as Record<string, unknown>)),
        pagination: json.pagination,
      }
    },
    staleTime: 15_000,
  })
}
