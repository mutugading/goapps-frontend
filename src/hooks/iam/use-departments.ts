"use client"

// Hook for listing IAM departments — used as a lightweight lookup map for dropdowns
// and label resolution wherever a department UUID needs to be displayed as a name.

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { createCrudHooks } from "@/lib/hooks"
import {
    type Department,
    type CreateDepartmentRequest,
    type UpdateDepartmentRequest,
    type ListDepartmentsParams,
    type ListDepartmentsResponse,
    type CreateDepartmentResponse,
    type UpdateDepartmentResponse,
    type DeleteDepartmentResponse,
    type GetDepartmentResponse,
    ListDepartmentsResponseParser,
    CreateDepartmentResponseParser,
    UpdateDepartmentResponseParser,
    DeleteDepartmentResponseParser,
    GetDepartmentResponseParser,
} from "@/types/iam/department"

export interface DepartmentOption {
    id: string
    code: string
    name: string
}

interface RawDepartment {
    departmentId?: string
    department_id?: string
    departmentCode?: string
    department_code?: string
    departmentName?: string
    department_name?: string
}

interface ListDepartmentsEnvelope {
    base?: { isSuccess?: boolean; message?: string }
    data?: RawDepartment[]
}

function normalizeDepartment(raw: RawDepartment): DepartmentOption {
    const id = raw.departmentId ?? raw.department_id ?? ""
    const code = raw.departmentCode ?? raw.department_code ?? ""
    const name = raw.departmentName ?? raw.department_name ?? ""
    return { id, code, name }
}

export const departmentKeys = {
    all: ["iam", "departments"] as const,
    list: () => ["iam", "departments", "list"] as const,
}

interface UseDepartmentsResult {
    items: DepartmentOption[]
    lookup: Map<string, string>
    isLoading: boolean
    isError: boolean
    error: Error | null
}

/**
 * Fetch all departments (paged once with pageSize=200, suitable for dropdown).
 * Returns both the items list and a Map<id, "code — name"> for label resolution.
 */
export function useDepartments(): UseDepartmentsResult {
    const query = useQuery({
        queryKey: departmentKeys.list(),
        queryFn: async (): Promise<DepartmentOption[]> => {
            const res = await apiClient.get<ListDepartmentsEnvelope>(
                "/api/v1/iam/departments?page=1&pageSize=200"
            )
            if (res.base && res.base.isSuccess === false) {
                throw new Error(res.base.message || "Failed to fetch departments")
            }
            const list = Array.isArray(res.data) ? res.data : []
            return list.map(normalizeDepartment)
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    })

    const items = useMemo(() => query.data ?? [], [query.data])
    const lookup = useMemo(() => {
        const m = new Map<string, string>()
        for (const d of items) {
            const label = d.name && d.code ? `${d.name} (${d.code})` : d.name || d.code || d.id
            m.set(d.id, label)
        }
        return m
    }, [items])

    return {
        items,
        lookup,
        isLoading: query.isLoading,
        isError: query.isError,
        error: (query.error as Error | null) ?? null,
    }
}

/** Resolve a department UUID to its label using the loaded list. */
export function useDepartmentLabel(departmentId: string | undefined | null): string {
    const { lookup } = useDepartments()
    if (!departmentId) return "—"
    return lookup.get(departmentId) ?? "—"
}

// =============================================================================
// CRUD hooks for departments (full Department entity, not the lookup-only form)
// =============================================================================

const {
    useList: useDepartmentList,
    useGet: useDepartment,
    useCreate: useCreateDepartment,
    useUpdate: useUpdateDepartment,
    useDelete: useDeleteDepartment,
    queryKeys: departmentCrudKeys,
} = createCrudHooks<
    Department,
    ListDepartmentsParams,
    CreateDepartmentRequest,
    UpdateDepartmentRequest,
    ListDepartmentsResponse,
    CreateDepartmentResponse,
    UpdateDepartmentResponse,
    DeleteDepartmentResponse,
    GetDepartmentResponse
>({
    serviceScope: "iam",
    resourceName: "department",
    apiBasePath: "/api/v1/iam/departments",
    parsers: {
        listResponse: (data) => ListDepartmentsResponseParser.fromJSON(data),
        createResponse: (data) => CreateDepartmentResponseParser.fromJSON(data),
        updateResponse: (data) => UpdateDepartmentResponseParser.fromJSON(data),
        deleteResponse: (data) => DeleteDepartmentResponseParser.fromJSON(data),
        getResponse: (data) => GetDepartmentResponseParser.fromJSON(data),
    },
    getEntityId: (entity) => entity.departmentId,
    messages: {
        createSuccess: "Department created successfully",
        updateSuccess: "Department updated successfully",
        deleteSuccess: "Department deleted successfully",
    },
})

export {
    useDepartmentList,
    useDepartment,
    useCreateDepartment,
    useUpdateDepartment,
    useDeleteDepartment,
    departmentCrudKeys,
}
