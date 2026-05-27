"use client"

// Employee Group Hooks - TanStack Query hooks for Employee Group operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type EmployeeGroup,
  type CreateEmployeeGroupRequest,
  type UpdateEmployeeGroupRequest,
  type ListEmployeeGroupsParams,
  type ListEmployeeGroupsResponse,
  type CreateEmployeeGroupResponse,
  type UpdateEmployeeGroupResponse,
  type DeleteEmployeeGroupResponse,
  type GetEmployeeGroupResponse,
  type ExportEmployeeGroupsResponse,
  type ImportEmployeeGroupsResponse,
  type DownloadEmployeeGroupTemplateResponse,
} from "@/types/iam/employee-group"

import {
  ListEmployeeGroupsResponse as ListEmployeeGroupsResponseParser,
  CreateEmployeeGroupResponse as CreateEmployeeGroupResponseParser,
  UpdateEmployeeGroupResponse as UpdateEmployeeGroupResponseParser,
  DeleteEmployeeGroupResponse as DeleteEmployeeGroupResponseParser,
  GetEmployeeGroupResponse as GetEmployeeGroupResponseParser,
  ExportEmployeeGroupsResponse as ExportResponseParser,
  ImportEmployeeGroupsResponse as ImportResponseParser,
  DownloadEmployeeGroupTemplateResponse as TemplateResponseParser,
} from "@/types/generated/iam/v1/employee_group"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useEmployeeGroups,
  useGet: useEmployeeGroup,
  useCreate: useCreateEmployeeGroup,
  useUpdate: useUpdateEmployeeGroup,
  useDelete: useDeleteEmployeeGroup,
  queryKeys: employeeGroupKeys,
} = createCrudHooks<
  EmployeeGroup,
  ListEmployeeGroupsParams,
  CreateEmployeeGroupRequest,
  UpdateEmployeeGroupRequest,
  ListEmployeeGroupsResponse,
  CreateEmployeeGroupResponse,
  UpdateEmployeeGroupResponse,
  DeleteEmployeeGroupResponse,
  GetEmployeeGroupResponse
>({
  serviceScope: "iam",
  resourceName: "employee-group",
  apiBasePath: "/api/v1/iam/employee-groups",
  parsers: {
    listResponse: (data) => ListEmployeeGroupsResponseParser.fromJSON(data),
    createResponse: (data) => CreateEmployeeGroupResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateEmployeeGroupResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteEmployeeGroupResponseParser.fromJSON(data),
    getResponse: (data) => GetEmployeeGroupResponseParser.fromJSON(data),
  },
  getEntityId: (employeeGroup) => employeeGroup.employeeGroupId,
  messages: {
    createSuccess: "Employee Group created successfully",
    updateSuccess: "Employee Group updated successfully",
    deleteSuccess: "Employee Group deleted successfully",
  },
})

// ============================================================================
// Export Hook
// ============================================================================

interface ExportParams {
  activeFilter?: number
}

export function useExportEmployeeGroups() {
  return useMutation({
    mutationFn: async (params: ExportParams = {}): Promise<ExportEmployeeGroupsResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/iam/employee-groups/export${queryString}`)
      return ExportResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "employee-groups-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export employee groups")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export employee groups")
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

export function useImportEmployeeGroups() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportEmployeeGroupsResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/iam/employee-groups/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employeeGroupKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, updatedCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${updatedCount} updated, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import employee groups")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import employee groups")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadEmployeeGroupTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadEmployeeGroupTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/iam/employee-groups/template")
      return TemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "employee-group-template.xlsx")
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
// Exports
// ============================================================================

export {
  useEmployeeGroups,
  useEmployeeGroup,
  useCreateEmployeeGroup,
  useUpdateEmployeeGroup,
  useDeleteEmployeeGroup,
  employeeGroupKeys,
}
