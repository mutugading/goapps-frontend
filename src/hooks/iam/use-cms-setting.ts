"use client"

// CMS Setting Hooks - TanStack Query hooks for CMS Setting operations

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"
import {
  type CMSSetting,
  type UpdateCMSSettingResponse,
  type BulkUpdateCMSSettingsResponse,
  type CMSSettingUpdate,
  ListCMSSettingsResponseParser,
  UpdateCMSSettingResponseParser,
  BulkUpdateCMSSettingsResponseParser,
} from "@/types/iam/cms-setting"

// ============================================================================
// Query Keys
// ============================================================================

export const cmsSettingKeys = {
  all: ["iam", "cms-setting"] as const,
  lists: () => [...cmsSettingKeys.all, "list"] as const,
  list: (group?: string) => [...cmsSettingKeys.lists(), group] as const,
}

// ============================================================================
// List Settings Hook
// ============================================================================

export function useCMSSettings(group?: string) {
  return useQuery({
    queryKey: cmsSettingKeys.list(group),
    queryFn: async (): Promise<{ data: CMSSetting[]; base?: { isSuccess: boolean; message: string } }> => {
      const url = group ? `/api/v1/iam/cms/settings?group=${group}` : "/api/v1/iam/cms/settings"
      const rawResponse = await apiClient.get<unknown>(url)
      const parsed = ListCMSSettingsResponseParser.fromJSON(rawResponse)
      return {
        data: parsed.data || [],
        base: parsed.base,
      }
    },
    staleTime: 30_000,
  })
}

// ============================================================================
// Update Setting Hook
// ============================================================================

export function useUpdateCMSSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ settingKey, settingValue }: { settingKey: string; settingValue: string }): Promise<UpdateCMSSettingResponse> => {
      const rawResponse = await apiClient.put<unknown>(`/api/v1/iam/cms/settings/${settingKey}`, {
        settingKey,
        settingValue,
      })
      return UpdateCMSSettingResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess) {
        queryClient.invalidateQueries({ queryKey: cmsSettingKeys.all })
        queryClient.invalidateQueries({ queryKey: ["public", "landing"] })
        toast.success("Setting updated successfully")
      } else {
        toast.error(response.base?.message || "Failed to update setting")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update setting")
    },
  })
}

// ============================================================================
// Bulk Update Settings Hook
// ============================================================================

export function useBulkUpdateCMSSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (settings: CMSSettingUpdate[]): Promise<BulkUpdateCMSSettingsResponse> => {
      const rawResponse = await apiClient.put<unknown>("/api/v1/iam/cms/settings", {
        settings,
      })
      return BulkUpdateCMSSettingsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess) {
        queryClient.invalidateQueries({ queryKey: cmsSettingKeys.all })
        queryClient.invalidateQueries({ queryKey: ["public", "landing"] })
        toast.success("Settings updated successfully")
      } else {
        toast.error(response.base?.message || "Failed to update settings")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update settings")
    },
  })
}
