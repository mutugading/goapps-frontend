"use client"

// Intermingling Hooks - TanStack Query hooks for Intermingling operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type Intermingling,
  type CreateInterminglingRequest,
  type UpdateInterminglingRequest,
  type ListInterminglingsParams,
  type ExportInterminglingsParams,
  type ListInterminglingsResponse,
  type CreateInterminglingResponse,
  type UpdateInterminglingResponse,
  type DeleteInterminglingResponse,
  type GetInterminglingResponse,
  type ExportInterminglingsResponse,
  type ImportInterminglingsResponse,
  type DownloadInterminglingTemplateResponse,
  ListInterminglingsResponseParser,
  CreateInterminglingResponseParser,
  UpdateInterminglingResponseParser,
  DeleteInterminglingResponseParser,
  GetInterminglingResponseParser,
  ExportInterminglingsResponseParser,
  ImportInterminglingsResponseParser,
  DownloadInterminglingTemplateResponseParser,
} from "@/types/finance/intermingling"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useInterminglings,
  useGet: useIntermingling,
  useCreate: useCreateIntermingling,
  useUpdate: useUpdateIntermingling,
  useDelete: useDeleteIntermingling,
  queryKeys: interminglingKeys,
} = createCrudHooks<
  Intermingling,
  ListInterminglingsParams,
  CreateInterminglingRequest,
  UpdateInterminglingRequest,
  ListInterminglingsResponse,
  CreateInterminglingResponse,
  UpdateInterminglingResponse,
  DeleteInterminglingResponse,
  GetInterminglingResponse
>({
  serviceScope: "finance",
  resourceName: "intermingling",
  apiBasePath: "/api/v1/finance/interminglings",
  parsers: {
    listResponse: (data) => ListInterminglingsResponseParser.fromJSON(data),
    createResponse: (data) => CreateInterminglingResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateInterminglingResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteInterminglingResponseParser.fromJSON(data),
    getResponse: (data) => GetInterminglingResponseParser.fromJSON(data),
  },
  getEntityId: (intermingling) => String(intermingling.intmId),
  messages: {
    createSuccess: "Intermingling created successfully",
    updateSuccess: "Intermingling updated successfully",
    deleteSuccess: "Intermingling deleted successfully",
  },
})

// Export CRUD hooks
export {
  useInterminglings,
  useIntermingling,
  useCreateIntermingling,
  useUpdateIntermingling,
  useDeleteIntermingling,
  interminglingKeys,
}

// ============================================================================
// Export Hook
// ============================================================================

export function useExportInterminglings() {
  return useMutation({
    mutationFn: async (params: ExportInterminglingsParams = {}): Promise<ExportInterminglingsResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/interminglings/export${queryString}`)
      return ExportInterminglingsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "interminglings-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export Interminglings")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export Interminglings")
    },
  })
}

// ============================================================================
// Import Hook
// ============================================================================

interface ImportData {
  fileContent: Uint8Array
  fileName: string
  duplicateAction: string
}

export function useImportInterminglings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportInterminglingsResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/interminglings/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportInterminglingsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: interminglingKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import Interminglings")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import Interminglings")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadInterminglingTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadInterminglingTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/interminglings/template")
      return DownloadInterminglingTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "intermingling-template.xlsx")
        toast.success("Template downloaded successfully")
      } else {
        toast.error(response.base?.message || "Failed to download template")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to download template")
    },
  })
}
