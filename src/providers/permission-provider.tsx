"use client"

import { createContext, useContext, useMemo } from "react"
import { useAuth } from "./auth-provider"

// Default permissions for unauthenticated users (public pages only)
const PUBLIC_PERMISSIONS = new Set([
    "dashboard.view",
])

// Full permissions for development/fallback when IAM is unavailable
const DEV_PERMISSIONS = new Set([
    "dashboard.view",
    "finance.view",
    "finance.dashboard.view",
    "finance.master.view",
    "finance.master.uom.view",
    "finance.master.parameters.view",
    "finance.transaction.view",
    "finance.transaction.costing-process.view",
    "it.view",
    "it.dashboard.view",
    "hr.view",
    "hr.dashboard.view",
    "ci.view",
    "ci.dashboard.view",
    "exsim.view",
    "exsim.dashboard.view",
    "settings.view",
])

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
    // 2. User's permissions from IAM (authenticated)
    // 3. Dev fallback permissions (authenticated but no IAM permissions)
    // 4. Public permissions (unauthenticated)
    const permissions = useMemo(() => {
        if (externalPermissions) {
            return externalPermissions
        }

        if (isAuthenticated && user) {
            // Use permissions from IAM
            if (user.permissions && user.permissions.length > 0) {
                return new Set(user.permissions)
            }
            // Fallback to dev permissions if authenticated but no permissions from IAM
            // This helps during development when IAM might not return permissions
            return DEV_PERMISSIONS
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

