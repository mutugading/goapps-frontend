"use client"

// RM Category Hooks - TanStack Query hooks for RM Category operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type RMCategory,
  type CreateRMCategoryRequest,
  type UpdateRMCategoryRequest,
  type ListRMCategoriesParams,
  type ExportRMCategoriesParams,
  type ListRMCategoriesResponse,
  type CreateRMCategoryResponse,
  type UpdateRMCategoryResponse,
  type DeleteRMCategoryResponse,
  type GetRMCategoryResponse,
  type ExportRMCategoriesResponse,
  type ImportRMCategoriesResponse,
  type DownloadRMCategoryTemplateResponse,
  ListRMCategoriesResponseParser,
  CreateRMCategoryResponseParser,
  UpdateRMCategoryResponseParser,
  DeleteRMCategoryResponseParser,
  GetRMCategoryResponseParser,
  ExportRMCategoriesResponseParser,
  ImportRMCategoriesResponseParser,
  DownloadRMCategoryTemplateResponseParser,
} from "@/types/finance/rm-category"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useRMCategories,
  useGet: useRMCategory,
  useCreate: useCreateRMCategory,
  useUpdate: useUpdateRMCategory,
  useDelete: useDeleteRMCategory,
  queryKeys: rmCategoryKeys,
} = createCrudHooks<
  RMCategory,
  ListRMCategoriesParams,
  CreateRMCategoryRequest,
  UpdateRMCategoryRequest,
  ListRMCategoriesResponse,
  CreateRMCategoryResponse,
  UpdateRMCategoryResponse,
  DeleteRMCategoryResponse,
  GetRMCategoryResponse
>({
  serviceScope: "finance",
  resourceName: "rm-category",
  apiBasePath: "/api/v1/finance/rm-categories",
  parsers: {
    listResponse: (data) => ListRMCategoriesResponseParser.fromJSON(data),
    createResponse: (data) => CreateRMCategoryResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateRMCategoryResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteRMCategoryResponseParser.fromJSON(data),
    getResponse: (data) => GetRMCategoryResponseParser.fromJSON(data),
  },
  getEntityId: (rmCategory) => rmCategory.rmCategoryId,
  messages: {
    createSuccess: "RM Category created successfully",
    updateSuccess: "RM Category updated successfully",
    deleteSuccess: "RM Category deleted successfully",
  },
})

// Export CRUD hooks
export {
  useRMCategories,
  useRMCategory,
  useCreateRMCategory,
  useUpdateRMCategory,
  useDeleteRMCategory,
  rmCategoryKeys,
}

// ============================================================================
// Export Hook
// ============================================================================

export function useExportRMCategories() {
  return useMutation({
    mutationFn: async (params: ExportRMCategoriesParams = {}): Promise<ExportRMCategoriesResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/rm-categories/export${queryString}`)
      return ExportRMCategoriesResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "rm-categories-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export RM Categories")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export RM Categories")
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

export function useImportRMCategories() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportRMCategoriesResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/rm-categories/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportRMCategoriesResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: rmCategoryKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, updatedCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import RM Categories")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import RM Categories")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadRMCategoryTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadRMCategoryTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/rm-categories/template")
      return DownloadRMCategoryTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "rm-category-template.xlsx")
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
