"use client"

// User Hooks - TanStack Query hooks for User operations

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { createCrudHooks } from "@/lib/hooks"
import { apiClient } from "@/lib/api"
import {
    type UserWithDetail,
    type CreateUserRequest,
    type UpdateUserRequest,
    type ListUsersParams,
    type ListUsersResponse,
    type CreateUserResponse,
    type UpdateUserResponse,
    type DeleteUserResponse,
    type GetUserDetailResponse,
    ListUsersResponseParser,
    CreateUserResponseParser,
    UpdateUserResponseParser,
    DeleteUserResponseParser,
    GetUserDetailResponseParser,
    type GetUserRolesAndPermissionsResponse,
    GetUserRolesAndPermissionsResponseParser,
    type AssignUserRolesResponse,
    AssignUserRolesResponseParser,
    type RemoveUserRolesResponse,
    RemoveUserRolesResponseParser,
} from "@/types/iam/user"

// ============================================================================
// Create CRUD hooks using factory
// ============================================================================

const {
    useList: useUsers,
    useGet: useUser,
    useCreate: useCreateUser,
    useUpdate: useUpdateUser,
    useDelete: useDeleteUser,
    queryKeys: userKeys,
} = createCrudHooks<
    UserWithDetail,
    ListUsersParams,
    CreateUserRequest,
    UpdateUserRequest,
    ListUsersResponse,
    CreateUserResponse,
    // Cast: UpdateUserResponse.data is User, but we only check base.isSuccess
    // The list is refetched on success anyway, so entity type mismatch is harmless
    CreateUserResponse,
    DeleteUserResponse,
    GetUserDetailResponse
>({
    serviceScope: "iam",
    resourceName: "User",
    apiBasePath: "/api/v1/iam/users",
    parsers: {
        listResponse: (data) => ListUsersResponseParser.fromJSON(data),
        createResponse: (data) => CreateUserResponseParser.fromJSON(data),
        updateResponse: (data) => {
            const parsed = UpdateUserResponseParser.fromJSON(data)
            // Wrap User into UserWithDetail-compatible shape for the factory
            return {
                base: parsed.base,
                data: parsed.data ? { user: parsed.data, detail: undefined, roleCodes: [] } : undefined,
            }
        },
        deleteResponse: (data) => DeleteUserResponseParser.fromJSON(data),
        getResponse: (data) => GetUserDetailResponseParser.fromJSON(data),
    },
    getEntityId: (user) => user.user?.userId || "",
    messages: {
        createSuccess: "User created successfully",
        updateSuccess: "User updated successfully",
        deleteSuccess: "User deleted successfully",
    },
})

export { useUsers, useUser, useCreateUser, useUpdateUser, useDeleteUser, userKeys }

// ============================================================================
// Update User Detail Hook
// ============================================================================

/**
 * Hook for updating user employee details (fullName, firstName, etc.)
 */
export function useUpdateUserDetail() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, data }: { userId: string; data: Record<string, unknown> }) => {
            const rawResponse = await apiClient.put<unknown>(`/api/v1/iam/users/${userId}/detail`, data)
            return rawResponse
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            toast.success("User detail updated successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update user detail")
        },
    })
}

// ============================================================================
// Role Assignment Hooks
// ============================================================================

/**
 * Hook for getting user roles and permissions
 */
export function useUserAccess(userId: string) {
    return useQuery({
        queryKey: ["iam", "user", "access", userId],
        queryFn: async (): Promise<GetUserRolesAndPermissionsResponse> => {
            const rawResponse = await apiClient.get<unknown>(`/api/v1/iam/users/${userId}/access`)
            return GetUserRolesAndPermissionsResponseParser.fromJSON(rawResponse)
        },
        enabled: !!userId,
    })
}

/**
 * Hook for assigning roles to a user
 */
export function useAssignUserRoles() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, roleIds }: { userId: string; roleIds: string[] }): Promise<AssignUserRolesResponse> => {
            const rawResponse = await apiClient.post<unknown>(`/api/v1/iam/users/${userId}/roles`, { roleIds })
            return AssignUserRolesResponseParser.fromJSON(rawResponse)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["iam", "user", "access", variables.userId] })
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            toast.success("Roles assigned successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to assign roles")
        },
    })
}

/**
 * Hook for removing roles from a user
 */
export function useRemoveUserRoles() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ userId, roleIds }: { userId: string; roleIds: string[] }): Promise<RemoveUserRolesResponse> => {
            const rawResponse = await apiClient.post<unknown>(`/api/v1/iam/users/${userId}/roles/remove`, { roleIds })
            return RemoveUserRolesResponseParser.fromJSON(rawResponse)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["iam", "user", "access", variables.userId] })
            queryClient.invalidateQueries({ queryKey: userKeys.lists() })
            toast.success("Roles removed successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove roles")
        },
    })
}
