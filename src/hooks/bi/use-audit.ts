"use client"

// BI config-change audit hook — paginated history of dashboard/group mutations.

import { useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api"
import { normalizeAuditEntry } from "@/types/bi"
import type { NormalizedAuditEntry, RawAuditEntry } from "@/types/bi"

export const auditKeys = {
  all: ["finance", "bi-audit"] as const,
  list: (entityType: string, page: number, pageSize: number) =>
    [...auditKeys.all, "list", entityType, page, pageSize] as const,
}

/** Parameters for the config-audit query. */
export interface ConfigAuditParams {
  page?: number
  pageSize?: number
  /** "" = all, "dashboard", or "group". */
  entityType?: string
}

/** Shape returned by the audit BFF route. */
interface AuditListResponse {
  base?: { isSuccess?: boolean; message?: string }
  data?: RawAuditEntry[]
  pagination?: {
    currentPage?: number
    pageSize?: number
    totalItems?: number | string
    totalPages?: number
  }
}

/** Normalized result with entries + pagination metadata. */
export interface ConfigAuditResult {
  entries: NormalizedAuditEntry[]
  totalItems: number
  totalPages: number
}

/** Paginated BI config-change audit log. */
export function useConfigAudit({ page = 1, pageSize = 20, entityType = "" }: ConfigAuditParams = {}) {
  return useQuery<ConfigAuditResult>({
    queryKey: auditKeys.list(entityType, page, pageSize),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (entityType) params.set("entityType", entityType)
      const raw = await apiClient.get<AuditListResponse>(`/api/v1/finance/bi/audit?${params.toString()}`)
      if (raw.base && raw.base.isSuccess === false) {
        throw new Error(raw.base.message ?? "Failed to list config audit")
      }
      return {
        entries: (raw.data ?? []).map(normalizeAuditEntry),
        totalItems: Number(raw.pagination?.totalItems ?? 0),
        totalPages: Number(raw.pagination?.totalPages ?? 0),
      }
    },
    staleTime: 15_000,
  })
}
