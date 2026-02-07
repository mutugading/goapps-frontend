"use client"

// UOM Hooks - TanStack Query hooks for UOM operations
// Uses proto-generated types with proper parsing

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type UOM,
  type CreateUOMRequest,
  type UpdateUOMRequest,
  type ListUOMsParams,
  type ExportUOMsParams,
  type ListUOMsResponse,
  type CreateUOMResponse,
  type UpdateUOMResponse,
  type DeleteUOMResponse,
  type GetUOMResponse,
  type ExportUOMsResponse,
  type ImportUOMsResponse,
  type DownloadTemplateResponse,
  ListUOMsResponseParser,
  CreateUOMResponseParser,
  UpdateUOMResponseParser,
  DeleteUOMResponseParser,
  GetUOMResponseParser,
  ExportUOMsResponseParser,
  ImportUOMsResponseParser,
  DownloadTemplateResponseParser,
} from "@/types/finance/uom"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useUOMs,
  useGet: useUOM,
  useCreate: useCreateUOM,
  useUpdate: useUpdateUOM,
  useDelete: useDeleteUOM,
  queryKeys: uomKeys,
} = createCrudHooks<
  UOM,
  ListUOMsParams,
  CreateUOMRequest,
  UpdateUOMRequest,
  ListUOMsResponse,
  CreateUOMResponse,
  UpdateUOMResponse,
  DeleteUOMResponse,
  GetUOMResponse
>({
  serviceScope: "finance", // Hierarchical query key: ["finance", "uom", ...]
  resourceName: "UOM",
  apiBasePath: "/api/v1/finance/uoms",
  parsers: {
    listResponse: (data) => ListUOMsResponseParser.fromJSON(data),
    createResponse: (data) => CreateUOMResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateUOMResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteUOMResponseParser.fromJSON(data),
    getResponse: (data) => GetUOMResponseParser.fromJSON(data),
  },
  getEntityId: (uom) => uom.uomId,
  messages: {
    createSuccess: "UOM created successfully",
    updateSuccess: "UOM updated successfully",
    deleteSuccess: "UOM deleted successfully",
  },
})

// Export CRUD hooks
export { useUOMs, useUOM, useCreateUOM, useUpdateUOM, useDeleteUOM, uomKeys }

// ============================================================================
// Export Hook
// ============================================================================

/**
 * Hook for exporting UOMs to Excel
 */
export function useExportUOMs() {
  return useMutation({
    mutationFn: async (params: ExportUOMsParams = {}): Promise<ExportUOMsResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/uoms/export${queryString}`)
      return ExportUOMsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "uoms-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export UOMs")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export UOMs")
    },
  })
}

// ============================================================================
// Import Hook
// ============================================================================

/**
 * Import request data
 */
interface ImportData {
  fileContent: Uint8Array
  fileName: string
  duplicateAction: string
}

/**
 * Hook for importing UOMs from Excel
 */
export function useImportUOMs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportUOMsResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/uoms/import", {
        fileContent: Array.from(data.fileContent), // Convert Uint8Array to array for JSON
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportUOMsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: uomKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, updatedCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import UOMs")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import UOMs")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

/**
 * Hook for downloading import template
 */
export function useDownloadTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/uoms/template")
      return DownloadTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "uom-template.xlsx")
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
