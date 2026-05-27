"use client"

// Employee Level Hooks - TanStack Query hooks for Employee Level operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type EmployeeLevel,
  type CreateEmployeeLevelRequest,
  type UpdateEmployeeLevelRequest,
  type ListEmployeeLevelsParams,
  type ListEmployeeLevelsResponse,
  type CreateEmployeeLevelResponse,
  type UpdateEmployeeLevelResponse,
  type DeleteEmployeeLevelResponse,
  type GetEmployeeLevelResponse,
  type ExportEmployeeLevelsResponse,
  type ImportEmployeeLevelsResponse,
  type DownloadEmployeeLevelTemplateResponse,
  type WorkflowTransitionParams,
  ListEmployeeLevelsResponseParser,
  CreateEmployeeLevelResponseParser,
  UpdateEmployeeLevelResponseParser,
  DeleteEmployeeLevelResponseParser,
  GetEmployeeLevelResponseParser,
} from "@/types/iam/employee-level"

import {
  ExportEmployeeLevelsResponse as ExportResponseParser,
  ImportEmployeeLevelsResponse as ImportResponseParser,
  DownloadEmployeeLevelTemplateResponse as TemplateResponseParser,
} from "@/types/generated/iam/v1/employee_level"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useEmployeeLevels,
  useGet: useEmployeeLevel,
  useCreate: useCreateEmployeeLevel,
  useUpdate: useUpdateEmployeeLevel,
  useDelete: useDeleteEmployeeLevel,
  queryKeys: employeeLevelKeys,
} = createCrudHooks<
  EmployeeLevel,
  ListEmployeeLevelsParams,
  CreateEmployeeLevelRequest,
  UpdateEmployeeLevelRequest,
  ListEmployeeLevelsResponse,
  CreateEmployeeLevelResponse,
  UpdateEmployeeLevelResponse,
  DeleteEmployeeLevelResponse,
  GetEmployeeLevelResponse
>({
  serviceScope: "iam",
  resourceName: "employee-level",
  apiBasePath: "/api/v1/iam/employee-levels",
  parsers: {
    listResponse: (data) => ListEmployeeLevelsResponseParser.fromJSON(data),
    createResponse: (data) => CreateEmployeeLevelResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateEmployeeLevelResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteEmployeeLevelResponseParser.fromJSON(data),
    getResponse: (data) => GetEmployeeLevelResponseParser.fromJSON(data),
  },
  getEntityId: (employeeLevel) => employeeLevel.employeeLevelId,
  messages: {
    createSuccess: "Employee Level created successfully",
    updateSuccess: "Employee Level updated successfully",
    deleteSuccess: "Employee Level deleted successfully",
  },
})

// ============================================================================
// Export Hook
// ============================================================================

interface ExportParams {
  activeFilter?: number
  type?: number
  workflow?: number
}

export function useExportEmployeeLevels() {
  return useMutation({
    mutationFn: async (params: ExportParams = {}): Promise<ExportEmployeeLevelsResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/iam/employee-levels/export${queryString}`)
      return ExportResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "employee-levels-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export employee levels")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export employee levels")
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

export function useImportEmployeeLevels() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportEmployeeLevelsResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/iam/employee-levels/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employeeLevelKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, updatedCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import employee levels")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import employee levels")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadEmployeeLevelTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadEmployeeLevelTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/iam/employee-levels/template")
      return TemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "employee-level-template.xlsx")
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

// ============================================================================
// Workflow Transition Hooks
// ============================================================================

function useWorkflowTransition(action: string, successMessage: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: WorkflowTransitionParams) => {
      const rawResponse = await apiClient.post<unknown>(
        `/api/v1/iam/employee-levels/${params.employeeLevelId}/${action}`,
        { notes: params.notes || "" }
      )
      return rawResponse
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeLevelKeys.all })
      toast.success(successMessage)
    },
    onError: (error: Error) => {
      toast.error(error.message || `Failed to ${action} employee level`)
    },
  })
}

export function useSubmitEmployeeLevel() {
  return useWorkflowTransition("submit", "Employee level submitted successfully")
}

export function useApproveEmployeeLevel() {
  return useWorkflowTransition("approve", "Employee level approved successfully")
}

export function useReleaseEmployeeLevel() {
  return useWorkflowTransition("release", "Employee level released successfully")
}

export function useBypassReleaseEmployeeLevel() {
  return useWorkflowTransition("bypass-release", "Employee level bypass released successfully")
}

// ============================================================================
// Exports
// ============================================================================

export {
  useEmployeeLevels,
  useEmployeeLevel,
  useCreateEmployeeLevel,
  useUpdateEmployeeLevel,
  useDeleteEmployeeLevel,
  employeeLevelKeys,
}
