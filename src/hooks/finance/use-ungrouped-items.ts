"use client"

// Grouping Monitor hooks — cross-period view of (item_code, grade_code)
// pairs filtered by scope: ungrouped (no active group) or grouped.

import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type ListUngroupedItemsParams,
  type ListUngroupedItemsResponse,
  type ExportUngroupedItemsParams,
  type ExportUngroupedItemsResponse,
  ListUngroupedItemsResponseParser,
  ExportUngroupedItemsResponseParser,
} from "@/types/finance/rm-group"

export const ungroupedItemKeys = {
  all: ["finance", "ungrouped-items"] as const,
  lists: () => [...ungroupedItemKeys.all, "list"] as const,
  list: (params: ListUngroupedItemsParams) => [...ungroupedItemKeys.lists(), params] as const,
}

export function useUngroupedItems(params: ListUngroupedItemsParams) {
  return useQuery({
    queryKey: ungroupedItemKeys.list(params),
    queryFn: async (): Promise<ListUngroupedItemsResponse> => {
      const qs = buildQueryString(params as unknown as Record<string, unknown>)
      const raw = await apiClient.get<unknown>(`/api/v1/finance/rm-groups/ungrouped${qs}`)
      return ListUngroupedItemsResponseParser.fromJSON(raw)
    },
  })
}

export function useExportUngroupedItems() {
  return useMutation({
    mutationFn: async (params: ExportUngroupedItemsParams = {}): Promise<ExportUngroupedItemsResponse> => {
      const qs = buildQueryString(params as Record<string, unknown>)
      const raw = await apiClient.get<unknown>(`/api/v1/finance/rm-groups/ungrouped/export${qs}`)
      return ExportUngroupedItemsResponseParser.fromJSON(raw)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "grouping-monitor-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export")
    },
  })
}
