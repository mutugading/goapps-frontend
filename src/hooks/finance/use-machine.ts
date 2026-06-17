"use client"

// Machine Hooks - TanStack Query hooks for Machine operations

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient, buildQueryString, downloadFileFromBytes } from "@/lib/api"
import {
  type Machine,
  type CreateMachineRequest,
  type UpdateMachineRequest,
  type ListMachinesParams,
  type ExportMachinesParams,
  type ListMachinesResponse,
  type CreateMachineResponse,
  type UpdateMachineResponse,
  type DeleteMachineResponse,
  type GetMachineResponse,
  type ExportMachinesResponse,
  type ImportMachinesResponse,
  type DownloadMachineTemplateResponse,
  ListMachinesResponseParser,
  CreateMachineResponseParser,
  UpdateMachineResponseParser,
  DeleteMachineResponseParser,
  GetMachineResponseParser,
  ExportMachinesResponseParser,
  ImportMachinesResponseParser,
  DownloadMachineTemplateResponseParser,
} from "@/types/finance/machine"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
  useList: useMachines,
  useGet: useMachine,
  useCreate: useCreateMachine,
  useUpdate: useUpdateMachine,
  useDelete: useDeleteMachine,
  queryKeys: machineKeys,
} = createCrudHooks<
  Machine,
  ListMachinesParams,
  CreateMachineRequest,
  UpdateMachineRequest,
  ListMachinesResponse,
  CreateMachineResponse,
  UpdateMachineResponse,
  DeleteMachineResponse,
  GetMachineResponse
>({
  serviceScope: "finance",
  resourceName: "machine",
  apiBasePath: "/api/v1/finance/machines",
  parsers: {
    listResponse: (data) => ListMachinesResponseParser.fromJSON(data),
    createResponse: (data) => CreateMachineResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateMachineResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteMachineResponseParser.fromJSON(data),
    getResponse: (data) => GetMachineResponseParser.fromJSON(data),
  },
  getEntityId: (machine) => String(machine.machineId),
  messages: {
    createSuccess: "Machine created successfully",
    updateSuccess: "Machine updated successfully",
    deleteSuccess: "Machine deleted successfully",
  },
})

// Export CRUD hooks
export {
  useMachines,
  useMachine,
  useCreateMachine,
  useUpdateMachine,
  useDeleteMachine,
  machineKeys,
}

// ============================================================================
// Export Hook
// ============================================================================

export function useExportMachines() {
  return useMutation({
    mutationFn: async (params: ExportMachinesParams = {}): Promise<ExportMachinesResponse> => {
      const queryString = buildQueryString(params as Record<string, unknown>)
      const rawResponse = await apiClient.get<unknown>(`/api/v1/finance/machines/export${queryString}`)
      return ExportMachinesResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "machines-export.xlsx")
        toast.success("Export completed successfully")
      } else {
        toast.error(response.base?.message || "Failed to export machines")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to export machines")
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

export function useImportMachines() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ImportData): Promise<ImportMachinesResponse> => {
      const rawResponse = await apiClient.post<unknown>("/api/v1/finance/machines/import", {
        fileContent: Array.from(data.fileContent),
        fileName: data.fileName,
        duplicateAction: data.duplicateAction,
      })
      return ImportMachinesResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: machineKeys.lists() })
      if (response.base?.isSuccess) {
        const { successCount, skippedCount, failedCount } = response
        toast.success(
          `Import completed: ${successCount} created, ${skippedCount} skipped, ${failedCount} failed`
        )
      } else {
        toast.error(response.base?.message || "Failed to import machines")
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import machines")
    },
  })
}

// ============================================================================
// Download Template Hook
// ============================================================================

export function useDownloadMachineTemplate() {
  return useMutation({
    mutationFn: async (): Promise<DownloadMachineTemplateResponse> => {
      const rawResponse = await apiClient.get<unknown>("/api/v1/finance/machines/template")
      return DownloadMachineTemplateResponseParser.fromJSON(rawResponse)
    },
    onSuccess: (response) => {
      if (response.base?.isSuccess && response.fileContent.length > 0) {
        downloadFileFromBytes(response.fileContent, response.fileName || "machine-template.xlsx")
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
