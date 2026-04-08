"use client"

// Formula Hooks - TanStack Query hooks for Formula operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type Formula,
  type CreateFormulaRequest,
  type UpdateFormulaRequest,
  type ListFormulasParams,
  type ExportFormulasParams,
  type ListFormulasResponse,
  type CreateFormulaResponse,
  type UpdateFormulaResponse,
  type DeleteFormulaResponse,
  type GetFormulaResponse,
  type ExportFormulasResponse,
  type ImportFormulasResponse,
  type DownloadFormulaTemplateResponse,
  ListFormulasResponseParser,
  CreateFormulaResponseParser,
  UpdateFormulaResponseParser,
  DeleteFormulaResponseParser,
  GetFormulaResponseParser,
  ExportFormulasResponseParser,
  ImportFormulasResponseParser,
  DownloadFormulaTemplateResponseParser,
} from "@/types/finance/formula"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useFormulas,
  useGet: useFormula,
  useCreate: useCreateFormula,
  useUpdate: useUpdateFormula,
  useDelete: useDeleteFormula,
  queryKeys: formulaKeys,
} = createCrudHooks<
  Formula,
  ListFormulasParams,
  CreateFormulaRequest,
  UpdateFormulaRequest,
  ListFormulasResponse,
  CreateFormulaResponse,
  UpdateFormulaResponse,
  DeleteFormulaResponse,
  GetFormulaResponse
>({
  serviceScope: "finance",
  resourceName: "formula",
  apiBasePath: "/api/v1/finance/formulas",
  parsers: {
    listResponse: (data) => ListFormulasResponseParser.fromJSON(data),
    createResponse: (data) => CreateFormulaResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateFormulaResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteFormulaResponseParser.fromJSON(data),
    getResponse: (data) => GetFormulaResponseParser.fromJSON(data),
  },
  getEntityId: (formula) => formula.formulaId,
  messages: {
    createSuccess: "Formula created successfully",
    updateSuccess: "Formula updated successfully",
    deleteSuccess: "Formula deleted successfully",
  },
})

// Export CRUD hooks
export { useFormulas, useFormula, useCreateFormula, useUpdateFormula, useDeleteFormula, formulaKeys }

// ============================================================================
// Export Hook
// ============================================================================

export function useExportFormulas() {
  return useMutation({
    mutationFn: async (params: ExportFormulasParams = {}): Promise<ExportFormulasResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/formulas/export${queryString}`)
      return ExportFormulasResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "formulas-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export formulas")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export formulas")
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

export function useImportFormulas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportFormulasResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/formulas/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportFormulasResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: formulaKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, updatedCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import formulas")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import formulas")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadFormulaTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadFormulaTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/formulas/template")
      return DownloadFormulaTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "formula-template.xlsx")
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
