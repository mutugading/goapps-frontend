"use client"

// Role Hooks - TanStack Query hooks for Role operations

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient } from "@/lib/api"
import {
    type Role,
    type CreateRoleRequest,
    type UpdateRoleRequest,
    type ListRolesParams,
    type ListRolesResponse,
    type CreateRoleResponse,
    type UpdateRoleResponse,
    type DeleteRoleResponse,
    type GetRoleResponse,
    type GetRolePermissionsResponse,
    type AssignRolePermissionsResponse,
    type RemoveRolePermissionsResponse,
    ListRolesResponseParser,
    CreateRoleResponseParser,
    UpdateRoleResponseParser,
    DeleteRoleResponseParser,
    GetRoleResponseParser,
    GetRolePermissionsResponseParser,
    AssignRolePermissionsResponseParser,
    RemoveRolePermissionsResponseParser,
} from "@/types/iam/role"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
    useList: useRoles,
    useGet: useRole,
    useCreate: useCreateRole,
    useUpdate: useUpdateRole,
    useDelete: useDeleteRole,
    queryKeys: roleKeys,
} = createCrudHooks<
    Role,
    ListRolesParams,
    CreateRoleRequest,
    UpdateRoleRequest,
    ListRolesResponse,
    CreateRoleResponse,
    UpdateRoleResponse,
    DeleteRoleResponse,
    GetRoleResponse
>({
    serviceScope: "iam",
    resourceName: "Role",
    apiBasePath: "/api/v1/iam/roles",
    parsers: {
        listResponse: (data) => ListRolesResponseParser.fromJSON(data),
        createResponse: (data) => CreateRoleResponseParser.fromJSON(data),
        updateResponse: (data) => UpdateRoleResponseParser.fromJSON(data),
        deleteResponse: (data) => DeleteRoleResponseParser.fromJSON(data),
        getResponse: (data) => GetRoleResponseParser.fromJSON(data),
    },
    getEntityId: (role) => role.roleId,
    messages: {
        createSuccess: "Role created successfully",
        updateSuccess: "Role updated successfully",
        deleteSuccess: "Role deleted successfully",
    },
})

export { useRoles, useRole, useCreateRole, useUpdateRole, useDeleteRole, roleKeys }

// ============================================================================
// Permission Assignment Hooks
// ============================================================================

/**
 * Hook for getting role permissions
 */
export function useRolePermissions(roleId: string) {
    return useQuery({
        queryKey: ["iam", "role", "permissions", roleId],
        queryFn: async (): Promise<GetRolePermissionsResponse> => {
            const rawResponse = await apiClient.get<unknown>(`/api/v1/iam/roles/${roleId}/permissions`)
            return GetRolePermissionsResponseParser.fromJSON(rawResponse)
        },
        enabled: !!roleId,
    })
}

/**
 * Hook for assigning permissions to a role
 */
export function useAssignRolePermissions() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }): Promise<AssignRolePermissionsResponse> => {
            const rawResponse = await apiClient.post<unknown>(`/api/v1/iam/roles/${roleId}/permissions`, { permissionIds })
            return AssignRolePermissionsResponseParser.fromJSON(rawResponse)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["iam", "role", "permissions", variables.roleId] })
            queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
            toast.success("Permissions assigned successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to assign permissions")
        },
    })
}

/**
 * Hook for removing permissions from a role
 */
export function useRemoveRolePermissions() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }): Promise<RemoveRolePermissionsResponse> => {
            const rawResponse = await apiClient.post<unknown>(`/api/v1/iam/roles/${roleId}/permissions/remove`, { permissionIds })
            return RemoveRolePermissionsResponseParser.fromJSON(rawResponse)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["iam", "role", "permissions", variables.roleId] })
            queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
            toast.success("Permissions removed successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove permissions")
        },
    })
}
