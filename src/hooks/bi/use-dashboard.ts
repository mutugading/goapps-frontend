"use client"

// BI Dashboard hooks — TanStack Query wrappers over the BFF routes.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient, buildQueryString } from "@/lib/api"
import { createCrudHooks } from "@/lib/hooks"
import type {
  Dashboard,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  ListDashboardsParams,
  ListDashboardsResponse,
  CreateDashboardResponse,
  UpdateDashboardResponse,
  DeleteDashboardResponse,
  GetDashboardResponse,
  GetDashboardByCodeResponse,
  DuplicateDashboardResponse,
  SetDashboardRolesResponse,
  ListAccessibleDashboardsResponse,
} from "@/types/bi"
import {
  ListDashboardsResponseParser,
  CreateDashboardResponseParser,
  UpdateDashboardResponseParser,
  DeleteDashboardResponseParser,
  GetDashboardResponseParser,
  GetDashboardByCodeResponseParser,
  DuplicateDashboardResponseParser,
  SetDashboardRolesResponseParser,
  ListAccessibleDashboardsResponseParser,
} from "@/types/bi"

// =========================================================================
// CRUD factory
// =========================================================================

const {
  useList: useDashboards,
  useGet: useDashboardById,
  useCreate: useCreateDashboard,
  useUpdate: useUpdateDashboard,
  useDelete: useDeleteDashboard,
  queryKeys: dashboardKeys,
} = createCrudHooks<
  Dashboard,
  ListDashboardsParams,
  CreateDashboardRequest,
  UpdateDashboardRequest,
  ListDashboardsResponse,
  CreateDashboardResponse,
  UpdateDashboardResponse,
  DeleteDashboardResponse,
  GetDashboardResponse
>({
  serviceScope: "finance",
  resourceName: "BiDashboard",
  apiBasePath: "/api/v1/finance/bi/dashboards",
  parsers: {
    listResponse: (data) => ListDashboardsResponseParser.fromJSON(data),
    createResponse: (data) => CreateDashboardResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateDashboardResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteDashboardResponseParser.fromJSON(data),
    getResponse: (data) => GetDashboardResponseParser.fromJSON(data),
  },
  getEntityId: (d) => d.dashboardId,
  messages: {
    createSuccess: "Dashboard created",
    updateSuccess: "Dashboard updated",
    deleteSuccess: "Dashboard deleted",
  },
})

export { useDashboards, useDashboardById, useCreateDashboard, useUpdateDashboard, useDeleteDashboard, dashboardKeys }

// =========================================================================
// Specialised hooks
// =========================================================================

/** Look up a dashboard by its business code (for the viewer page). */
export function useDashboardByCode(code: string | undefined) {
  return useQuery({
    queryKey: [...dashboardKeys.all, "by-code", code] as const,
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/bi/dashboards/by-code/${code}`)
      const parsed: GetDashboardByCodeResponse = GetDashboardByCodeResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to load dashboard")
      return parsed.data
    },
    enabled: Boolean(code),
    staleTime: 60_000,
  })
}

/** Duplicate an existing dashboard. */
export function useDuplicateDashboard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { dashboardId: string; newCode: string; newTitle: string }) => {
      const raw = await apiClient.post<unknown>(`/api/v1/finance/bi/dashboards/${vars.dashboardId}/duplicate`, vars)
      const parsed: DuplicateDashboardResponse = DuplicateDashboardResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to duplicate")
      return parsed.data
    },
    onSuccess: (data) => {
      toast.success(`Dashboard duplicated as ${data?.dashboardCode}`)
      void qc.invalidateQueries({ queryKey: dashboardKeys.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

/** Overwrite the role whitelist for a dashboard. */
export function useSetDashboardRoles() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (vars: { dashboardId: string; roleCodes: string[] }) => {
      const raw = await apiClient.put<unknown>(`/api/v1/finance/bi/dashboards/${vars.dashboardId}/roles`, { roleCodes: vars.roleCodes })
      const parsed: SetDashboardRolesResponse = SetDashboardRolesResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to set roles")
      return parsed.roleCodes
    },
    onSuccess: () => {
      toast.success("Dashboard roles updated")
      void qc.invalidateQueries({ queryKey: dashboardKeys.all })
    },
    onError: (err: Error) => toast.error(err.message),
  })
}

/** Viewer-side: list dashboards the calling user can access. Used by /finance/bi landing. */
export function useAccessibleDashboards() {
  return useQuery({
    queryKey: [...dashboardKeys.all, "accessible"] as const,
    queryFn: async () => {
      const raw = await apiClient.get<unknown>("/api/v1/finance/bi/dashboards/accessible")
      const parsed: ListAccessibleDashboardsResponse = ListAccessibleDashboardsResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to list dashboards")
      return parsed.data
    },
    staleTime: 30_000,
  })
}

// Re-export buildQueryString in case feature code wants to call the list URL directly.
export { buildQueryString }
