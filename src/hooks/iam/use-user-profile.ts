"use client"

// Hook for fetching current user's full profile detail
// Returns UserDetail with all editable fields

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

// Query keys for user profile
export const userProfileKeys = {
    all: ["iam", "userProfile"] as const,
    me: () => [...userProfileKeys.all, "me"] as const,
}

interface UserDetail {
    detailId: string
    userId: string
    employeeCode: string
    fullName: string
    firstName: string
    lastName: string
    phone?: string
    profilePictureUrl?: string
    position?: string
    dateOfBirth?: string
    address?: string
    section?: {
        sectionId: string
        sectionCode: string
        sectionName: string
        departmentId: string
        departmentCode: string
        departmentName: string
        divisionId: string
        divisionCode: string
        divisionName: string
        companyId: string
        companyCode: string
        companyName: string
    }
}

interface User {
    userId: string
    username: string
    email: string
    isActive: boolean
    isLocked: boolean
    twoFactorEnabled: boolean
    lastLoginAt?: string
}

export interface UserWithDetail {
    user: User
    detail: UserDetail
    roleCodes: string[]
}

interface UserProfileResponse {
    base?: {
        isSuccess: boolean
        message: string
    }
    data?: unknown
}

// Response parser
function parseUserWithDetail(data: unknown): UserWithDetail | null {
    if (!data || typeof data !== "object") return null
    const obj = data as Record<string, unknown>

    const user = obj.user as Record<string, unknown> | undefined
    const detail = obj.detail as Record<string, unknown> | undefined

    if (!user || !detail) return null

    return {
        user: {
            userId: (user.userId ?? user.user_id ?? "") as string,
            username: (user.username ?? "") as string,
            email: (user.email ?? "") as string,
            isActive: Boolean(user.isActive ?? user.is_active ?? true),
            isLocked: Boolean(user.isLocked ?? user.is_locked ?? false),
            twoFactorEnabled: Boolean(user.twoFactorEnabled ?? user.two_factor_enabled ?? false),
            lastLoginAt: (user.lastLoginAt ?? user.last_login_at) as string | undefined,
        },
        detail: {
            detailId: (detail.detailId ?? detail.detail_id ?? "") as string,
            userId: (detail.userId ?? detail.user_id ?? "") as string,
            employeeCode: (detail.employeeCode ?? detail.employee_code ?? "") as string,
            fullName: (detail.fullName ?? detail.full_name ?? "") as string,
            firstName: (detail.firstName ?? detail.first_name ?? "") as string,
            lastName: (detail.lastName ?? detail.last_name ?? "") as string,
            phone: (detail.phone ?? undefined) as string | undefined,
            profilePictureUrl: (detail.profilePictureUrl ?? detail.profile_picture_url ?? undefined) as string | undefined,
            position: (detail.position ?? undefined) as string | undefined,
            dateOfBirth: (detail.dateOfBirth ?? detail.date_of_birth ?? undefined) as string | undefined,
            address: (detail.address ?? undefined) as string | undefined,
            section: detail.section as UserDetail["section"],
        },
        roleCodes: Array.isArray(obj.roleCodes ?? obj.role_codes)
            ? (obj.roleCodes ?? obj.role_codes) as string[]
            : [],
    }
}

/**
 * Hook to fetch current user's full profile detail
 * Fetches from /api/v1/iam/users/me (returns UserWithDetail)
 */
export function useUserProfile() {
    return useQuery({
        queryKey: userProfileKeys.me(),
        queryFn: async (): Promise<UserWithDetail | null> => {
            const response = await apiClient.get<UserProfileResponse>("/api/v1/iam/users/me")

            if (!response.base?.isSuccess) {
                return null
            }

            return parseUserWithDetail(response.data)
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: false,
        refetchOnWindowFocus: true,
    })
}
