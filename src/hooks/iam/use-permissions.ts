"use client"

// Permission Hooks - TanStack Query hooks for Permission operations

import { useQuery } from "@tanstack/react-query"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient } from "@/lib/api"
import {
    type PermissionDetail,
    type ListPermissionsParams,
    type ListPermissionsResponse,
    type CreatePermissionRequest,
    type UpdatePermissionRequest,
    type CreatePermissionResponse,
    type UpdatePermissionResponse,
    type DeletePermissionResponse,
    type GetPermissionResponse,
    type GetPermissionsByServiceResponse,
    ListPermissionsResponseParser,
    CreatePermissionResponseParser,
    UpdatePermissionResponseParser,
    DeletePermissionResponseParser,
    GetPermissionResponseParser,
    GetPermissionsByServiceResponseParser,
} from "@/types/iam/role"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
    useList: usePermissions,
    useGet: usePermission,
    useCreate: useCreatePermission,
    useUpdate: useUpdatePermission,
    useDelete: useDeletePermission,
    queryKeys: permissionKeys,
} = createCrudHooks<
    PermissionDetail,
    ListPermissionsParams,
    CreatePermissionRequest,
    UpdatePermissionRequest,
    ListPermissionsResponse,
    CreatePermissionResponse,
    UpdatePermissionResponse,
    DeletePermissionResponse,
    GetPermissionResponse
>({
    serviceScope: "iam",
    resourceName: "Permission",
    apiBasePath: "/api/v1/iam/permissions",
    parsers: {
        listResponse: (data) => ListPermissionsResponseParser.fromJSON(data),
        createResponse: (data) => CreatePermissionResponseParser.fromJSON(data),
        updateResponse: (data) => UpdatePermissionResponseParser.fromJSON(data),
        deleteResponse: (data) => DeletePermissionResponseParser.fromJSON(data),
        getResponse: (data) => GetPermissionResponseParser.fromJSON(data),
    },
    getEntityId: (permission) => permission.permissionId,
    messages: {
        createSuccess: "Permission created successfully",
        updateSuccess: "Permission updated successfully",
        deleteSuccess: "Permission deleted successfully",
    },
})

export {
    usePermissions,
    usePermission,
    useCreatePermission,
    useUpdatePermission,
    useDeletePermission,
    permissionKeys,
}

// ============================================================================
// Permission by Service Hook (used in role/menu permission dialogs)
// ============================================================================

/**
 * Hook for getting permissions grouped by service/module
 * Used in the role permissions assignment dialog
 */
export function usePermissionsByService(serviceName?: string) {
    return useQuery({
        queryKey: ["iam", "permission", "by-service", serviceName || "all"],
        queryFn: async (): Promise<GetPermissionsByServiceResponse> => {
            const params = serviceName ? `?serviceName=${serviceName}` : ""
            const rawResponse = await apiClient.get<unknown>(`/api/v1/iam/permissions/by-service${params}`)
            return GetPermissionsByServiceResponseParser.fromJSON(rawResponse)
        },
        staleTime: 5 * 60 * 1000, // 5 minutes - permissions don't change often
    })
}

/**
 * Hook returning the full flat permission catalog (all services), each entry
 * carrying menuId/menuTitle. Backed by GetPermissionsByService which has NO
 * pagination cap — unlike ListPermissions whose page_size is limited to 100,
 * so it is the correct source when a picker/catalog needs every permission.
 */
export function useAllPermissions() {
    const query = usePermissionsByService()
    const data = (query.data?.data ?? [])
        .flatMap((service) => service.modules ?? [])
        .flatMap((mod) => mod.permissions ?? [])
    return { data, isLoading: query.isLoading, isError: query.isError }
}
