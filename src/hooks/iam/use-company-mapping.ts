"use client"

// Company Mapping Hooks - TanStack Query hooks for CompanyMapping operations

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"
import { createCrudHooks } from "@/lib/hooks"
import {
  type CompanyMapping,
  type CreateCompanyMappingRequest,
  type UpdateCompanyMappingRequest,
  type ListCompanyMappingsParams,
  type ListCompanyMappingsResponse,
  type CreateCompanyMappingResponse,
  type UpdateCompanyMappingResponse,
  type DeleteCompanyMappingResponse,
  type GetCompanyMappingResponse,
  ListCompanyMappingsResponseParser,
  CreateCompanyMappingResponseParser,
  UpdateCompanyMappingResponseParser,
  DeleteCompanyMappingResponseParser,
  GetCompanyMappingResponseParser,
} from "@/types/iam/company-mapping"
import {
  GetUserCompanyMappingsResponse as GetUserCompanyMappingsResponseParser,
  type GetUserCompanyMappingsResponse,
  type UserCompanyMappingRef,
} from "@/types/generated/iam/v1/user"

const {
  useList: useCompanyMappings,
  useGet: useCompanyMapping,
  useCreate: useCreateCompanyMapping,
  useUpdate: useUpdateCompanyMapping,
  useDelete: useDeleteCompanyMapping,
  queryKeys: companyMappingKeys,
} = createCrudHooks<
  CompanyMapping,
  ListCompanyMappingsParams,
  CreateCompanyMappingRequest,
  UpdateCompanyMappingRequest,
  ListCompanyMappingsResponse,
  CreateCompanyMappingResponse,
  UpdateCompanyMappingResponse,
  DeleteCompanyMappingResponse,
  GetCompanyMappingResponse
>({
  serviceScope: "iam",
  resourceName: "company-mapping",
  apiBasePath: "/api/v1/iam/company-mappings",
  parsers: {
    listResponse: (data) => ListCompanyMappingsResponseParser.fromJSON(data),
    createResponse: (data) => CreateCompanyMappingResponseParser.fromJSON(data),
    updateResponse: (data) => UpdateCompanyMappingResponseParser.fromJSON(data),
    deleteResponse: (data) => DeleteCompanyMappingResponseParser.fromJSON(data),
    getResponse: (data) => GetCompanyMappingResponseParser.fromJSON(data),
  },
  getEntityId: (entity) => entity.companyMappingId,
  messages: {
    createSuccess: "Company mapping created successfully",
    updateSuccess: "Company mapping updated successfully",
    deleteSuccess: "Company mapping deleted successfully",
  },
})

// =============================================================================
// User mapping assignments
// =============================================================================

export interface UserCompanyMappingsResult {
  data: UserCompanyMappingRef[]
  primaryCompanyMappingId: string
}

export const userCompanyMappingKeys = {
  all: ["iam", "users", "company-mappings"] as const,
  byUser: (userId: string) => ["iam", "users", "company-mappings", userId] as const,
}

export function useCompanyMappingsByUser(userId: string | undefined | null) {
  return useQuery<UserCompanyMappingsResult>({
    queryKey: userCompanyMappingKeys.byUser(userId || ""),
    enabled: !!userId,
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/api/v1/iam/users/${userId}/company-mappings`
      )
      const parsed: GetUserCompanyMappingsResponse =
        GetUserCompanyMappingsResponseParser.fromJSON(raw)
      if (parsed.base && parsed.base.isSuccess === false) {
        throw new Error(parsed.base.message || "Failed to fetch user mappings")
      }
      return {
        data: parsed.data ?? [],
        primaryCompanyMappingId: parsed.primaryCompanyMappingId ?? "",
      }
    },
    staleTime: 30_000,
  })
}

export interface AssignUserCompanyMappingParams {
  userId: string
  companyMappingId: string
  isPrimary?: boolean
}

export function useAssignUserCompanyMapping() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: AssignUserCompanyMappingParams) => {
      return apiClient.post<{ base?: { isSuccess?: boolean; message?: string } }>(
        `/api/v1/iam/users/${params.userId}/company-mappings`,
        {
          companyMappingId: params.companyMappingId,
          isPrimary: !!params.isPrimary,
        }
      )
    },
    onSuccess: (response, vars) => {
      if (response.base && response.base.isSuccess === false) {
        toast.error(response.base.message || "Failed to assign mapping")
        return
      }
      toast.success("Mapping assigned successfully")
      qc.invalidateQueries({ queryKey: userCompanyMappingKeys.byUser(vars.userId) })
      qc.invalidateQueries({ queryKey: ["iam", "users"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign mapping")
    },
  })
}

export interface RemoveUserCompanyMappingParams {
  userId: string
  companyMappingId: string
}

export function useRemoveUserCompanyMapping() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params: RemoveUserCompanyMappingParams) => {
      return apiClient.delete<{ base?: { isSuccess?: boolean; message?: string } }>(
        `/api/v1/iam/users/${params.userId}/company-mappings/${params.companyMappingId}`
      )
    },
    onSuccess: (response, vars) => {
      if (response.base && response.base.isSuccess === false) {
        toast.error(response.base.message || "Failed to remove mapping")
        return
      }
      toast.success("Mapping removed successfully")
      qc.invalidateQueries({ queryKey: userCompanyMappingKeys.byUser(vars.userId) })
      qc.invalidateQueries({ queryKey: ["iam", "users"] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove mapping")
    },
  })
}

export {
  useCompanyMappings,
  useCompanyMapping,
  useCreateCompanyMapping,
  useUpdateCompanyMapping,
  useDeleteCompanyMapping,
  companyMappingKeys,
}
