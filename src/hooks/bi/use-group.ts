"use client"

// BI dashboard-group hooks.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"
import type {
  DashboardGroup,
  ListDashboardGroupsResponse,
  CreateDashboardGroupRequest,
  CreateDashboardGroupResponse,
  UpdateDashboardGroupRequest,
  UpdateDashboardGroupResponse,
  DeleteDashboardGroupResponse,
} from "@/types/bi"
import {
  ListDashboardGroupsResponseParser,
  CreateDashboardGroupResponseParser,
  UpdateDashboardGroupResponseParser,
  DeleteDashboardGroupResponseParser,
} from "@/types/bi"

export const groupKeys = {
  all: ["finance", "bi-group"] as const,
  list: (includeInactive: boolean) => [...groupKeys.all, "list", includeInactive] as const,
}

/** List dashboard groups. */
export function useDashboardGroups(includeInactive = false) {
  return useQuery<DashboardGroup[]>({
    queryKey: groupKeys.list(includeInactive),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(`/api/v1/finance/bi/groups?includeInactive=${includeInactive}`)
      const parsed: ListDashboardGroupsResponse = ListDashboardGroupsResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to list groups")
      return parsed.data
    },
    staleTime: 60_000,
  })
}

export function useCreateDashboardGroup() {
  const qc = useQueryClient()
  return useMutation<DashboardGroup | undefined, Error, CreateDashboardGroupRequest>({
    mutationFn: async (req) => {
      const raw = await apiClient.post<unknown>("/api/v1/finance/bi/groups", req)
      const parsed: CreateDashboardGroupResponse = CreateDashboardGroupResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to create group")
      return parsed.data
    },
    onSuccess: () => {
      toast.success("Group created")
      void qc.invalidateQueries({ queryKey: groupKeys.all })
    },
    onError: (err) => toast.error(err.message),
  })
}

export function useUpdateDashboardGroup() {
  const qc = useQueryClient()
  return useMutation<DashboardGroup | undefined, Error, { groupId: string } & UpdateDashboardGroupRequest>({
    mutationFn: async ({ groupId, ...rest }) => {
      const raw = await apiClient.put<unknown>(`/api/v1/finance/bi/groups/${groupId}`, rest)
      const parsed: UpdateDashboardGroupResponse = UpdateDashboardGroupResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to update group")
      return parsed.data
    },
    onSuccess: () => {
      toast.success("Group updated")
      void qc.invalidateQueries({ queryKey: groupKeys.all })
    },
    onError: (err) => toast.error(err.message),
  })
}

export function useDeleteDashboardGroup() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (groupId) => {
      const raw = await apiClient.delete<unknown>(`/api/v1/finance/bi/groups/${groupId}`)
      const parsed: DeleteDashboardGroupResponse = DeleteDashboardGroupResponseParser.fromJSON(raw)
      if (!parsed.base?.isSuccess) throw new Error(parsed.base?.message ?? "Failed to delete group")
    },
    onSuccess: () => {
      toast.success("Group deleted")
      void qc.invalidateQueries({ queryKey: groupKeys.all })
    },
    onError: (err) => toast.error(err.message),
  })
}
