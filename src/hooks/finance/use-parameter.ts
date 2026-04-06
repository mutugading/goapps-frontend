"use client"

// Parameter Hooks - TanStack Query hooks for Parameter operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type Parameter,
  type CreateParameterRequest,
  type UpdateParameterRequest,
  type ListParametersParams,
  type ExportParametersParams,
  type ListParametersResponse,
  type CreateParameterResponse,
  type UpdateParameterResponse,
  type DeleteParameterResponse,
  type GetParameterResponse,
  type ExportParametersResponse,
  type ImportParametersResponse,
  type DownloadParameterTemplateResponse,
  ListParametersResponseParser,
  CreateParameterResponseParser,
  UpdateParameterResponseParser,
  DeleteParameterResponseParser,
  GetParameterResponseParser,
  ExportParametersResponseParser,
  ImportParametersResponseParser,
  DownloadParameterTemplateResponseParser,
} from "@/types/finance/parameter"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useParameters,
  useGet: useParameter,
  useCreate: useCreateParameter,
  useUpdate: useUpdateParameter,
  useDelete: useDeleteParameter,
  queryKeys: parameterKeys,
} = createCrudHooks<
  Parameter,
  ListParametersParams,
  CreateParameterRequest,
  UpdateParameterRequest,
  ListParametersResponse,
  CreateParameterResponse,
  UpdateParameterResponse,
  DeleteParameterResponse,
  GetParameterResponse
>({
  serviceScope: "finance",
  resourceName: "parameter",
  apiBasePath: "/api/v1/finance/parameters",
  parsers: {
    listResponse: (data) => ListParametersResponseParser.fromJSON(data),
    createResponse: (data) => CreateParameterResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateParameterResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteParameterResponseParser.fromJSON(data),
    getResponse: (data) => GetParameterResponseParser.fromJSON(data),
  },
  getEntityId: (parameter) => parameter.paramId,
  messages: {
    createSuccess: "Parameter created successfully",
    updateSuccess: "Parameter updated successfully",
    deleteSuccess: "Parameter deleted successfully",
  },
})

// Export CRUD hooks
export {
  useParameters,
  useParameter,
  useCreateParameter,
  useUpdateParameter,
  useDeleteParameter,
  parameterKeys,
}

// ============================================================================
// Export Hook
// ============================================================================

/**
 * Hook for exporting Parameters to Excel
 */
export function useExportParameters() {
  return useMutation({
    mutationFn: async (params: ExportParametersParams = {}): Promise<ExportParametersResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/parameters/export${queryString}`)
      return ExportParametersResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "parameters-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export Parameters")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export Parameters")
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

export function useImportParameters() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportParametersResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/parameters/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportParametersResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: parameterKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, updatedCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import Parameters")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import Parameters")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadParameterTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadParameterTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/parameters/template")
      return DownloadParameterTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "parameter-template.xlsx")
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
