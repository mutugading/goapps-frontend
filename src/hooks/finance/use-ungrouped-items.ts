"use client"

// Ungrouped Items hook - items in cst_item_cons_stk_po not in any active group

import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type ListUngroupedItemsParams,
  type ListUngroupedItemsResponse,
  type ExportUngroupedItemsResponse,
  ListUngroupedItemsResponseParser,
  ExportUngroupedItemsResponseParser,
} from "@/types/finance/rm-group"

export interface ExportUngroupedItemsParams {
  period?: string
  search?: string
}

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
    enabled: !!params.period,
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
        downloadFileFromBytes(response.fileContent, response.fileName || "ungrouped-items-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export ungrouped items")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export ungrouped items")
    },
  })
}
