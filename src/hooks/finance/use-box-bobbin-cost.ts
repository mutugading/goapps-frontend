"use client"

// BoxBobbinCost Hooks - TanStack Query hooks for BoxBobbinCost operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type BoxBobbinCost,
  type CreateBoxBobbinCostRequest,
  type UpdateBoxBobbinCostRequest,
  type ListBoxBobbinCostsParams,
  type ExportBoxBobbinCostsParams,
  type ListBoxBobbinCostsResponse,
  type CreateBoxBobbinCostResponse,
  type UpdateBoxBobbinCostResponse,
  type DeleteBoxBobbinCostResponse,
  type GetBoxBobbinCostResponse,
  type ExportBoxBobbinCostsResponse,
  type ImportBoxBobbinCostsResponse,
  type DownloadBoxBobbinCostTemplateResponse,
  ListBoxBobbinCostsResponseParser,
  CreateBoxBobbinCostResponseParser,
  UpdateBoxBobbinCostResponseParser,
  DeleteBoxBobbinCostResponseParser,
  GetBoxBobbinCostResponseParser,
  ExportBoxBobbinCostsResponseParser,
  ImportBoxBobbinCostsResponseParser,
  DownloadBoxBobbinCostTemplateResponseParser,
} from "@/types/finance/box-bobbin-cost"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useBoxBobbinCosts,
  useGet: useBoxBobbinCost,
  useCreate: useCreateBoxBobbinCost,
  useUpdate: useUpdateBoxBobbinCost,
  useDelete: useDeleteBoxBobbinCost,
  queryKeys: boxBobbinCostKeys,
} = createCrudHooks<
  BoxBobbinCost,
  ListBoxBobbinCostsParams,
  CreateBoxBobbinCostRequest,
  UpdateBoxBobbinCostRequest,
  ListBoxBobbinCostsResponse,
  CreateBoxBobbinCostResponse,
  UpdateBoxBobbinCostResponse,
  DeleteBoxBobbinCostResponse,
  GetBoxBobbinCostResponse
>({
  serviceScope: "finance",
  resourceName: "box-bobbin-cost",
  apiBasePath: "/api/v1/finance/box-bobbin-costs",
  parsers: {
    listResponse: (data) => ListBoxBobbinCostsResponseParser.fromJSON(data),
    createResponse: (data) => CreateBoxBobbinCostResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateBoxBobbinCostResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteBoxBobbinCostResponseParser.fromJSON(data),
    getResponse: (data) => GetBoxBobbinCostResponseParser.fromJSON(data),
  },
  getEntityId: (boxBobbinCost) => String(boxBobbinCost.bbcId),
  messages: {
    createSuccess: "Box Bobbin Cost created successfully",
    updateSuccess: "Box Bobbin Cost updated successfully",
    deleteSuccess: "Box Bobbin Cost deleted successfully",
  },
})

// Export CRUD hooks
export {
  useBoxBobbinCosts,
  useBoxBobbinCost,
  useCreateBoxBobbinCost,
  useUpdateBoxBobbinCost,
  useDeleteBoxBobbinCost,
  boxBobbinCostKeys,
}

// ============================================================================
// Export Hook
// ============================================================================

export function useExportBoxBobbinCosts() {
  return useMutation({
    mutationFn: async (params: ExportBoxBobbinCostsParams = {}): Promise<ExportBoxBobbinCostsResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/box-bobbin-costs/export${queryString}`)
      return ExportBoxBobbinCostsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "box-bobbin-costs-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export Box Bobbin Costs")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export Box Bobbin Costs")
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

export function useImportBoxBobbinCosts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportBoxBobbinCostsResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/box-bobbin-costs/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportBoxBobbinCostsResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: boxBobbinCostKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import Box Bobbin Costs")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import Box Bobbin Costs")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadBoxBobbinCostTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadBoxBobbinCostTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/box-bobbin-costs/template")
      return DownloadBoxBobbinCostTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "box-bobbin-cost-template.xlsx")
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
