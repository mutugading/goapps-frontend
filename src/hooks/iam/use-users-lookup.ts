"use client"

// Lightweight users lookup — fetches up to 200 users to resolve UUIDs → usernames
// in tables and detail pages. Cached for 5 minutes.

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"

export interface UserLookupEntry {
    id: string
    username: string
    fullName: string
    email: string
}

interface RawListEntry {
    user?: {
        userId?: string
        user_id?: string
        username?: string
        email?: string
    }
    detail?: {
        fullName?: string
        full_name?: string
    }
}

interface ListEnvelope {
    base?: { isSuccess?: boolean; message?: string }
    data?: RawListEntry[]
}

function normalize(entry: RawListEntry): UserLookupEntry {
    const u = entry.user || {}
    const d = entry.detail || {}
    return {
        id: u.userId ?? u.user_id ?? "",
        username: u.username ?? "",
        email: u.email ?? "",
        fullName: d.fullName ?? d.full_name ?? "",
    }
}

export const usersLookupKeys = {
    all: ["iam", "users-lookup"] as const,
}

interface UseUsersLookupResult {
    items: UserLookupEntry[]
    lookup: Map<string, UserLookupEntry>
    /** Resolve a UUID → preferred display label (username, then full name, then "—"). */
    label: (id: string | undefined | null) => string
    isLoading: boolean
    isError: boolean
}

export function useUsersLookup(): UseUsersLookupResult {
    const query = useQuery({
        queryKey: usersLookupKeys.all,
        queryFn: async (): Promise<UserLookupEntry[]> => {
            const res = await apiClient.get<ListEnvelope>(
                "/api/v1/iam/users?page=1&pageSize=200"
            )
            if (res.base && res.base.isSuccess === false) {
                throw new Error(res.base.message || "Failed to fetch users")
            }
            const list = Array.isArray(res.data) ? res.data : []
            return list.map(normalize).filter((u) => u.id)
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
    })

    const items = useMemo(() => query.data ?? [], [query.data])
    const lookup = useMemo(() => {
        const m = new Map<string, UserLookupEntry>()
        for (const u of items) m.set(u.id, u)
        return m
    }, [items])

    const label = (id: string | undefined | null): string => {
        if (!id) return "—"
        const u = lookup.get(id)
        if (!u) return "—"
        return u.username || u.fullName || u.email || "—"
    }

    return {
        items,
        lookup,
        label,
        isLoading: query.isLoading,
        isError: query.isError,
    }
}
