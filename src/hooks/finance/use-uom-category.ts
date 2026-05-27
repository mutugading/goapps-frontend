"use client"

// UOM Category Hooks - TanStack Query hooks for UOM Category operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type UOMCategory,
  type CreateUOMCategoryRequest,
  type UpdateUOMCategoryRequest,
  type ListUOMCategoriesParams,
  type ExportUOMCategoriesParams,
  type ListUOMCategoriesResponse,
  type CreateUOMCategoryResponse,
  type UpdateUOMCategoryResponse,
  type DeleteUOMCategoryResponse,
  type GetUOMCategoryResponse,
  type ExportUOMCategoriesResponse,
  type ImportUOMCategoriesResponse,
  type DownloadUOMCategoryTemplateResponse,
  ListUOMCategoriesResponseParser,
  CreateUOMCategoryResponseParser,
  UpdateUOMCategoryResponseParser,
  DeleteUOMCategoryResponseParser,
  GetUOMCategoryResponseParser,
  ExportUOMCategoriesResponseParser,
  ImportUOMCategoriesResponseParser,
  DownloadUOMCategoryTemplateResponseParser,
} from "@/types/finance/uom-category"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useUOMCategories,
  useGet: useUOMCategory,
  useCreate: useCreateUOMCategory,
  useUpdate: useUpdateUOMCategory,
  useDelete: useDeleteUOMCategory,
  queryKeys: uomCategoryKeys,
} = createCrudHooks<
  UOMCategory,
  ListUOMCategoriesParams,
  CreateUOMCategoryRequest,
  UpdateUOMCategoryRequest,
  ListUOMCategoriesResponse,
  CreateUOMCategoryResponse,
  UpdateUOMCategoryResponse,
  DeleteUOMCategoryResponse,
  GetUOMCategoryResponse
>({
  serviceScope: "finance",
  resourceName: "uom-category",
  apiBasePath: "/api/v1/finance/uom-categories",
  parsers: {
    listResponse: (data) => ListUOMCategoriesResponseParser.fromJSON(data),
    createResponse: (data) => CreateUOMCategoryResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateUOMCategoryResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteUOMCategoryResponseParser.fromJSON(data),
    getResponse: (data) => GetUOMCategoryResponseParser.fromJSON(data),
  },
  getEntityId: (uomCategory) => uomCategory.uomCategoryId,
  messages: {
    createSuccess: "UOM Category created successfully",
    updateSuccess: "UOM Category updated successfully",
    deleteSuccess: "UOM Category deleted successfully",
  },
})

// Export CRUD hooks
export {
  useUOMCategories,
  useUOMCategory,
  useCreateUOMCategory,
  useUpdateUOMCategory,
  useDeleteUOMCategory,
  uomCategoryKeys,
}

// ============================================================================
// Export Hook
// ============================================================================

export function useExportUOMCategories() {
  return useMutation({
    mutationFn: async (params: ExportUOMCategoriesParams = {}): Promise<ExportUOMCategoriesResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/uom-categories/export${queryString}`)
      return ExportUOMCategoriesResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "uom-categories-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export UOM Categories")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export UOM Categories")
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

export function useImportUOMCategories() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportUOMCategoriesResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/uom-categories/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportUOMCategoriesResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: uomCategoryKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, updatedCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import UOM Categories")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import UOM Categories")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadUOMCategoryTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadUOMCategoryTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/uom-categories/template")
      return DownloadUOMCategoryTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "uom-category-template.xlsx")
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
