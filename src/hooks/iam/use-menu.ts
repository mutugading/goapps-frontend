"use client"

// Menu Hooks - TanStack Query hooks for Menu operations

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api"
import {
    type NormalizedMenu,
    type NormalizedMenuWithChildren,
    type CreateMenuData,
    type UpdateMenuData,
    type ListMenusParams,
    normalizeMenuTree,
    normalizeMenu,
} from "@/types/iam/menu"

// =============================================================================
// Query Keys
// =============================================================================

export const menuKeys = {
    all:      () => ["iam", "menu"] as const,
    tree:     () => ["iam", "menu", "tree"] as const,
    fullTree: (params?: { serviceName?: string; includeInactive?: boolean; includeHidden?: boolean }) =>
        ["iam", "menu", "tree", "full", params] as const,
    lists:    () => ["iam", "menu", "list"] as const,
    list:     (params: ListMenusParams) => ["iam", "menu", "list", params] as const,
    details:  () => ["iam", "menu", "detail"] as const,
    detail:   (id: string) => ["iam", "menu", "detail", id] as const,
    perms:    (id: string) => ["iam", "menu", "permissions", id] as const,
}

// =============================================================================
// Read Hooks
// =============================================================================

/**
 * Get menu tree for the current authenticated user, filtered by their permissions.
 * Used by AppSidebar to render dynamic navigation.
 */
export function useMenuTree(serviceName?: string) {
    return useQuery({
        queryKey: menuKeys.tree(),
        queryFn: async (): Promise<NormalizedMenuWithChildren[]> => {
            const params = serviceName ? `?serviceName=${serviceName}` : ""
            const raw = await apiClient.get<{ data: unknown[] }>(`/api/v1/iam/menus/tree${params}`)
            return normalizeMenuTree((raw?.data as Parameters<typeof normalizeMenuTree>[0]) ?? [])
        },
        staleTime: 60 * 1000, // 1 minute — menus change infrequently
    })
}

/**
 * Get full menu tree for admin management (not filtered by permissions).
 * Used by Menu Management page.
 */
export function useFullMenuTree(params?: { serviceName?: string; includeInactive?: boolean; includeHidden?: boolean }) {
    return useQuery({
        queryKey: menuKeys.fullTree(params),
        queryFn: async (): Promise<NormalizedMenuWithChildren[]> => {
            const searchParams = new URLSearchParams()
            if (params?.serviceName)     searchParams.set("serviceName", params.serviceName)
            if (params?.includeInactive) searchParams.set("includeInactive", "true")
            if (params?.includeHidden)   searchParams.set("includeHidden", "true")
            const query = searchParams.toString() ? `?${searchParams.toString()}` : ""
            const raw = await apiClient.get<{ data: unknown[] }>(`/api/v1/iam/menus/tree/full${query}`)
            return normalizeMenuTree((raw?.data as Parameters<typeof normalizeMenuTree>[0]) ?? [])
        },
        staleTime: 30 * 1000,
    })
}

/**
 * Get paginated list of menus (flat list, for table view).
 */
export function useMenus(params: ListMenusParams) {
    return useQuery({
        queryKey: menuKeys.list(params),
        queryFn: async () => {
            const searchParams = new URLSearchParams()
            searchParams.set("page",     String(params.page))
            searchParams.set("pageSize", String(params.pageSize))
            if (params.search)      searchParams.set("search", params.search)
            if (params.serviceName) searchParams.set("serviceName", params.serviceName)
            if (params.sortBy)      searchParams.set("sortBy", params.sortBy)
            if (params.sortOrder)   searchParams.set("sortOrder", params.sortOrder)
            const raw = await apiClient.get<{ base: unknown; data: unknown[]; pagination: unknown }>(
                `/api/v1/iam/menus?${searchParams.toString()}`
            )
            return {
                data: ((raw?.data ?? []) as Parameters<typeof normalizeMenu>[0][]).map(normalizeMenu),
                pagination: raw?.pagination,
            }
        },
        staleTime: 30 * 1000,
    })
}

/**
 * Get a single menu by ID.
 */
export function useMenu(menuId: string) {
    return useQuery({
        queryKey: menuKeys.detail(menuId),
        queryFn: async (): Promise<NormalizedMenu> => {
            const raw = await apiClient.get<{ data: unknown }>(`/api/v1/iam/menus/${menuId}`)
            return normalizeMenu(raw?.data as Parameters<typeof normalizeMenu>[0])
        },
        enabled: !!menuId,
    })
}

/**
 * Get permissions assigned to a menu.
 */
export function useMenuPermissions(menuId: string) {
    return useQuery({
        queryKey: menuKeys.perms(menuId),
        queryFn: async () => {
            const raw = await apiClient.get<{ data: unknown[] }>(`/api/v1/iam/menus/${menuId}/permissions`)
            return raw?.data ?? []
        },
        enabled: !!menuId,
    })
}

// =============================================================================
// Mutation Hooks
// =============================================================================

export function useCreateMenu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: CreateMenuData) => {
            return apiClient.post<{ data: unknown }>("/api/v1/iam/menus", data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.all() })
            toast.success("Menu created successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create menu")
        },
    })
}

export function useUpdateMenu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ menuId, data }: { menuId: string; data: UpdateMenuData }) => {
            return apiClient.put<{ data: unknown }>(`/api/v1/iam/menus/${menuId}`, data)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: menuKeys.detail(variables.menuId) })
            queryClient.invalidateQueries({ queryKey: menuKeys.all() })
            toast.success("Menu updated successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update menu")
        },
    })
}

export function useDeleteMenu() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ menuId, cascade = false }: { menuId: string; cascade?: boolean }) => {
            return apiClient.delete<{ deletedCount: number }>(`/api/v1/iam/menus/${menuId}?cascade=${cascade}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.all() })
            toast.success("Menu deleted successfully")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete menu")
        },
    })
}

export function useAssignMenuPermissions() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ menuId, permissionIds }: { menuId: string; permissionIds: string[] }) => {
            return apiClient.post(`/api/v1/iam/menus/${menuId}/permissions`, { permissionIds })
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: menuKeys.perms(variables.menuId) })
            queryClient.invalidateQueries({ queryKey: menuKeys.all() })
            toast.success("Permissions assigned to menu")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to assign permissions")
        },
    })
}

export function useRemoveMenuPermissions() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ menuId, permissionIds }: { menuId: string; permissionIds: string[] }) => {
            return apiClient.post(`/api/v1/iam/menus/${menuId}/permissions/remove`, { permissionIds })
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: menuKeys.perms(variables.menuId) })
            queryClient.invalidateQueries({ queryKey: menuKeys.all() })
            toast.success("Permissions removed from menu")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to remove permissions")
        },
    })
}

export function useReorderMenus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ parentId, menuIds }: { parentId: string | null; menuIds: string[] }) => {
            return apiClient.post("/api/v1/iam/menus/reorder", { parentId, menuIds })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: menuKeys.all() })
            toast.success("Menu order updated")
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to reorder menus")
        },
    })
}
