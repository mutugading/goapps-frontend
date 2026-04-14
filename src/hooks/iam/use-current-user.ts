"use client"

// Hook for fetching current authenticated user via gRPC
// Used by sidebar and other components that need user info

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { AuthUser } from "@/types/generated/iam/v1/auth"
import { useUserProfile } from "./use-user-profile"

// Query keys for current user
export const currentUserKeys = {
    all: ["iam", "currentUser"] as const,
    me: () => [...currentUserKeys.all, "me"] as const,
}

// Response parser (convert snake_case to camelCase)
function parseAuthUser(data: unknown): AuthUser | null {
    if (!data || typeof data !== "object") return null
    const obj = data as Record<string, unknown>
    return {
        userId: (obj.userId ?? obj.user_id ?? "") as string,
        username: (obj.username ?? "") as string,
        email: (obj.email ?? "") as string,
        fullName: (obj.fullName ?? obj.full_name ?? "") as string,
        profilePictureUrl: (obj.profilePictureUrl ?? obj.profile_picture_url ?? "") as string,
        roles: Array.isArray(obj.roles) ? obj.roles : [],
        permissions: Array.isArray(obj.permissions) ? obj.permissions : [],
        twoFactorEnabled: Boolean(obj.twoFactorEnabled ?? obj.two_factor_enabled ?? false),
        emailVerified: Boolean(obj.emailVerified ?? obj.email_verified ?? false),
    }
}

interface CurrentUserResponse {
    base?: {
        isSuccess: boolean
        message: string
    }
    data?: unknown
}

/**
 * Hook to fetch current authenticated user
 * Fetches from /api/v1/iam/auth/me (gRPC endpoint)
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: currentUserKeys.me(),
        queryFn: async (): Promise<AuthUser | null> => {
            const response = await apiClient.get<CurrentUserResponse>("/api/v1/iam/auth/me")

            if (!response.base?.isSuccess) {
                return null
            }

            return parseAuthUser(response.data)
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: false, // Don't retry on 401
        refetchOnWindowFocus: true,
    })
}

// Helper to get user display data for NavUser component
export function useUserDisplay() {
    const { data: user, isLoading, error } = useCurrentUser()
    const { data: userProfile } = useUserProfile()

    // Prefer avatar from full profile detail (likely fresher after upload)
    const avatarUrl = userProfile?.detail.profilePictureUrl || user?.profilePictureUrl

    return {
        user: user ? {
            name: user.fullName || user.username,
            email: user.email,
            avatar: avatarUrl || undefined,
        } : null,
        isLoading,
        error,
    }
}
