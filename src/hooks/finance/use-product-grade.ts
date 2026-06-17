"use client"

// ProductGrade Hooks - TanStack Query hooks for ProductGrade operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type ProductGrade,
  type CreateProductGradeRequest,
  type UpdateProductGradeRequest,
  type ListProductGradesParams,
  type ExportProductGradesParams,
  type ListProductGradesResponse,
  type CreateProductGradeResponse,
  type UpdateProductGradeResponse,
  type DeleteProductGradeResponse,
  type GetProductGradeResponse,
  type ExportProductGradesResponse,
  type ImportProductGradesResponse,
  type DownloadProductGradeTemplateResponse,
  ListProductGradesResponseParser,
  CreateProductGradeResponseParser,
  UpdateProductGradeResponseParser,
  DeleteProductGradeResponseParser,
  GetProductGradeResponseParser,
  ExportProductGradesResponseParser,
  ImportProductGradesResponseParser,
  DownloadProductGradeTemplateResponseParser,
} from "@/types/finance/product-grade"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useProductGrades,
  useGet: useProductGrade,
  useCreate: useCreateProductGrade,
  useUpdate: useUpdateProductGrade,
  useDelete: useDeleteProductGrade,
  queryKeys: productGradeKeys,
} = createCrudHooks<
  ProductGrade,
  ListProductGradesParams,
  CreateProductGradeRequest,
  UpdateProductGradeRequest,
  ListProductGradesResponse,
  CreateProductGradeResponse,
  UpdateProductGradeResponse,
  DeleteProductGradeResponse,
  GetProductGradeResponse
>({
  serviceScope: "finance",
  resourceName: "product-grade",
  apiBasePath: "/api/v1/finance/product-grades",
  parsers: {
    listResponse: (data) => ListProductGradesResponseParser.fromJSON(data),
    createResponse: (data) => CreateProductGradeResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateProductGradeResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteProductGradeResponseParser.fromJSON(data),
    getResponse: (data) => GetProductGradeResponseParser.fromJSON(data),
  },
  getEntityId: (productGrade) => String(productGrade.pgId),
  messages: {
    createSuccess: "Product Grade created successfully",
    updateSuccess: "Product Grade updated successfully",
    deleteSuccess: "Product Grade deleted successfully",
  },
})

// Export CRUD hooks
export {
  useProductGrades,
  useProductGrade,
  useCreateProductGrade,
  useUpdateProductGrade,
  useDeleteProductGrade,
  productGradeKeys,
}

// ============================================================================
// Export Hook
// ============================================================================

export function useExportProductGrades() {
  return useMutation({
    mutationFn: async (params: ExportProductGradesParams = {}): Promise<ExportProductGradesResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/product-grades/export${queryString}`)
      return ExportProductGradesResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "product-grades-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export Product Grades")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export Product Grades")
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

export function useImportProductGrades() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportProductGradesResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/product-grades/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportProductGradesResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: productGradeKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import Product Grades")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import Product Grades")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadProductGradeTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadProductGradeTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/product-grades/template")
      return DownloadProductGradeTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "product-grade-template.xlsx")
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
