"use client"

// CRUD Hook Factory - Generate TanStack Query hooks for CRUD operations

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient, buildQueryString as defaultBuildQueryString, ApiError } from "@/lib/api"
import { BaseResponse, PaginationResponse } from "@/types/generated/common/v1/common"
import type {
  CrudHookOptions,
  CrudHooks,
  ListResponse,
  EntityResponse,
  DeleteResponse,
  NormalizedListResult,
} from "./types"

/**
 * Normalize pagination from proto-parsed response
 */
function normalizePagination(pagination?: PaginationResponse): NormalizedListResult<never>["pagination"] {
  if (!pagination) {
    return {
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
    }
  }
  return {
    currentPage: pagination.currentPage || 1,
    pageSize: pagination.pageSize || 10,
    totalItems: Number(pagination.totalItems) || 0,
    totalPages: pagination.totalPages || 0,
  }
}

/**
 * Check if operation was successful from base response
 */
function isSuccess(base?: BaseResponse): boolean {
  if (!base) return true // No base response means raw success
  return base.isSuccess
}

/**
 * Get message from base response
 */
function getMessage(base?: BaseResponse): string {
  return base?.message || ""
}

/**
 * Create CRUD hooks for a resource using proto-generated types
 */
export function createCrudHooks<
  TEntity,
  TListParams,
  TCreateRequest,
  TUpdateRequest,
  TListResponse extends ListResponse<TEntity> = ListResponse<TEntity>,
  TCreateResponse extends EntityResponse<TEntity> = EntityResponse<TEntity>,
  TUpdateResponse extends EntityResponse<TEntity> = EntityResponse<TEntity>,
  TDeleteResponse extends DeleteResponse = DeleteResponse,
  TGetResponse extends EntityResponse<TEntity> = EntityResponse<TEntity>
>(
  options: CrudHookOptions<
    TEntity,
    TListParams,
    TCreateRequest,
    TUpdateRequest,
    TListResponse,
    TCreateResponse,
    TUpdateResponse,
    TDeleteResponse,
    TGetResponse
  >
): CrudHooks<
  TEntity,
  TListParams,
  TCreateRequest,
  TUpdateRequest,
  TListResponse,
  TGetResponse
> {
  const {
    serviceScope,
    resourceName,
    apiBasePath,
    parsers,
    messages = {},
    // getEntityId is available for future use (e.g., optimistic updates)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getEntityId,
    buildQueryString = defaultBuildQueryString,
  } = options

  // Default messages
  const defaultMessages = {
    createSuccess: `${resourceName} created successfully`,
    createError: `Failed to create ${resourceName}`,
    updateSuccess: `${resourceName} updated successfully`,
    updateError: `Failed to update ${resourceName}`,
    deleteSuccess: `${resourceName} deleted successfully`,
    deleteError: `Failed to delete ${resourceName}`,
    fetchError: `Failed to fetch ${resourceName}`,
  }

  const msgs = { ...defaultMessages, ...messages }

  // Hierarchical query keys scoped by service
  // Format: [serviceScope, resourceName, operation, ...params]
  // Example: ["finance", "uom", "list", "{"page":1}"]
  // Note: params are serialized to string for stable cache keys (object reference equality)
  const queryKeys = {
    all: [serviceScope, resourceName.toLowerCase()] as const,
    lists: () => [...queryKeys.all, "list"] as const,
    list: (params: TListParams) => [...queryKeys.lists(), JSON.stringify(params)] as const,
    details: () => [...queryKeys.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.details(), id] as const,
  }

  // Default cache configuration for list queries
  // staleTime: How long data is considered fresh (won't refetch)
  // gcTime: How long unused data stays in cache
  const defaultCacheConfig = {
    staleTime: 30 * 1000, // 30 seconds - data is fresh
    gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache
  }

  // useList hook
  function useList(params: TListParams = {} as TListParams) {
    return useQuery({
      queryKey: queryKeys.list(params),
      queryFn: async (): Promise<NormalizedListResult<TEntity>> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryString = buildQueryString(params as any)
        const rawResponse = await apiClient.get<unknown>(`${apiBasePath}${queryString}`)
        const response = parsers.listResponse(rawResponse)

        return {
          data: response.data || [],
          pagination: normalizePagination(response.pagination),
          isSuccess: isSuccess(response.base),
          message: getMessage(response.base),
        }
      },
      // Cache configuration for better performance
      staleTime: defaultCacheConfig.staleTime,
      gcTime: defaultCacheConfig.gcTime,
    })
  }

  // useGet hook
  function useGet(id: string) {
    return useQuery({
      queryKey: queryKeys.detail(id),
      queryFn: async () => {
        const rawResponse = await apiClient.get<unknown>(`${apiBasePath}/${id}`)
        const response = parsers.getResponse(rawResponse)

        return {
          data: response.data || null,
          isSuccess: isSuccess(response.base),
          message: getMessage(response.base),
        }
      },
      enabled: !!id,
      // Cache configuration - detail queries can be cached longer
      staleTime: defaultCacheConfig.staleTime,
      gcTime: defaultCacheConfig.gcTime,
    })
  }

  // useCreate hook
  function useCreate() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (data: TCreateRequest): Promise<TEntity | undefined> => {
        const rawResponse = await apiClient.post<unknown>(apiBasePath, data)
        const response = parsers.createResponse(rawResponse)

        if (!isSuccess(response.base)) {
          throw new ApiError(
            getMessage(response.base) || msgs.createError,
            parseInt(response.base?.statusCode || "400", 10),
            response.base?.validationErrors || []
          )
        }

        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() })
        toast.success(msgs.createSuccess)
      },
      onError: (error: Error) => {
        toast.error(error.message || msgs.createError)
      },
    })
  }

  // useUpdate hook
  function useUpdate() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({
        id,
        data,
      }: {
        id: string
        data: TUpdateRequest
      }): Promise<TEntity | undefined> => {
        const rawResponse = await apiClient.put<unknown>(`${apiBasePath}/${id}`, data)
        const response = parsers.updateResponse(rawResponse)

        if (!isSuccess(response.base)) {
          throw new ApiError(
            getMessage(response.base) || msgs.updateError,
            parseInt(response.base?.statusCode || "400", 10),
            response.base?.validationErrors || []
          )
        }

        return response.data
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() })
        toast.success(msgs.updateSuccess)
      },
      onError: (error: Error) => {
        toast.error(error.message || msgs.updateError)
      },
    })
  }

  // useDelete hook
  function useDelete() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async (id: string): Promise<void> => {
        const rawResponse = await apiClient.delete<unknown>(`${apiBasePath}/${id}`)
        const response = parsers.deleteResponse(rawResponse)

        if (!isSuccess(response.base)) {
          throw new ApiError(
            getMessage(response.base) || msgs.deleteError,
            parseInt(response.base?.statusCode || "400", 10),
            response.base?.validationErrors || []
          )
        }
      },
      onSuccess: (_, id) => {
        queryClient.removeQueries({ queryKey: queryKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() })
        toast.success(msgs.deleteSuccess)
      },
      onError: (error: Error) => {
        toast.error(error.message || msgs.deleteError)
      },
    })
  }

  return {
    useList,
    useGet,
    useCreate,
    useUpdate,
    useDelete,
    queryKeys,
  }
}
