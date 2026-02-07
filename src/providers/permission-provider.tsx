"use client"

import { createContext, useContext, useMemo } from "react"

// Hardcoded permissions — will be replaced by IAM API later
const DEFAULT_PERMISSIONS = new Set([
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
    hasPermission: (code: string) => boolean
    hasAnyPermission: (...codes: string[]) => boolean
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
    const permissions = externalPermissions ?? DEFAULT_PERMISSIONS

    const value = useMemo<PermissionContextValue>(
        () => ({
            permissions,
            hasPermission: (code: string) => permissions.has(code),
            hasAnyPermission: (...codes: string[]) =>
                codes.some((code) => permissions.has(code)),
        }),
        [permissions]
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
