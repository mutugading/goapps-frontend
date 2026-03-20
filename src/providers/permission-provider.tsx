"use client"

import { createContext, useContext, useMemo } from "react"
import { useAuth } from "./auth-provider"

// Permissions for unauthenticated users — public pages only.
const PUBLIC_PERMISSIONS = new Set<string>([])

// Minimum permissions for authenticated users who have no assigned roles/permissions.
// Only the main dashboard is accessible until a role is assigned by an administrator.
const AUTHENTICATED_NO_ROLE_PERMISSIONS = new Set<string>(["dashboard.view"])

export interface PermissionContextValue {
    permissions: Set<string>
    roles: string[]
    hasPermission: (code: string) => boolean
    hasAnyPermission: (...codes: string[]) => boolean
    hasRole: (role: string) => boolean
    hasAnyRole: (...roles: string[]) => boolean
}

const PermissionContext = createContext<PermissionContextValue | null>(null)

interface PermissionProviderProps {
    children: React.ReactNode
    permissions?: Set<string>
}

export function PermissionProvider({
    children,
    permissions: externalPermissions,
}: PermissionProviderProps) {
    const { user, isAuthenticated } = useAuth()

    // Determine permissions from:
    // 1. External prop (override)
    // 2. User's permissions from IAM (authenticated with roles/permissions)
    // 3. Minimum permissions for authenticated users with no assigned roles
    // 4. Empty set for unauthenticated users
    const permissions = useMemo(() => {
        if (externalPermissions) {
            return externalPermissions
        }

        if (isAuthenticated && user) {
            if (user.permissions && user.permissions.length > 0) {
                return new Set<string>(user.permissions)
            }
            // Authenticated but no permissions assigned → show only Dashboard.
            // This is the correct behavior: a user without any role should only
            // see the main dashboard until an administrator assigns them a role.
            return AUTHENTICATED_NO_ROLE_PERMISSIONS
        }

        return PUBLIC_PERMISSIONS
    }, [externalPermissions, isAuthenticated, user])

    const roles = useMemo(() => {
        return user?.roles || []
    }, [user])

    const value = useMemo<PermissionContextValue>(
        () => ({
            permissions,
            roles,
            hasPermission: (code: string) => permissions.has(code),
            hasAnyPermission: (...codes: string[]) =>
                codes.some((code) => permissions.has(code)),
            hasRole: (role: string) => roles.includes(role),
            hasAnyRole: (...roleList: string[]) =>
                roleList.some((role) => roles.includes(role)),
        }),
        [permissions, roles]
    )

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    )
}

export function usePermissionContext() {
    const context = useContext(PermissionContext)
    if (!context) {
        throw new Error(
            "usePermissionContext must be used within a PermissionProvider"
        )
    }
    return context
}

