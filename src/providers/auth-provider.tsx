"use client"

// AuthProvider - Global authentication context
// Manages user session, token refresh, idle timeout, and auth state

import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react"
import { useRouter } from "next/navigation"
import type { AuthUser } from "@/types/generated/iam/v1/auth"
import { AUTH_API, TOKEN_CONFIG } from "@/lib/auth/config"
import { useIdleTimeout } from "@/lib/hooks/use-idle-timeout"
import { IdleTimeoutDialog } from "@/components/common/idle-timeout-dialog"
import type { AuthContextValue, AuthState, LoginFormValues, LoginResult } from "@/lib/auth/types"

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
    children: React.ReactNode
    initialUser?: AuthUser | null
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
    const router = useRouter()
    const [state, setState] = useState<AuthState>({
        user: initialUser,
        isAuthenticated: !!initialUser,
        isLoading: !initialUser, // If no initial user, we need to check
        error: null,
    })

    // Fetch current user from /me endpoint
    const fetchCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
        try {
            const response = await fetch(AUTH_API.ME, {
                method: "GET",
                credentials: "include",
            })

            if (!response.ok) {
                return null
            }

            const data = await response.json()

            if (!data.base?.isSuccess || !data.data) {
                return null
            }

            return data.data
        } catch (error) {
            console.error("Failed to fetch current user:", error)
            return null
        }
    }, [])

    // Refresh session (silent token refresh)
    const refreshSession = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch(AUTH_API.REFRESH, {
                method: "POST",
                credentials: "include",
            })

            if (!response.ok) {
                // Refresh failed, user needs to re-login
                setState((prev) => ({
                    ...prev,
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                }))
                return false
            }

            return true
        } catch (error) {
            console.error("Session refresh failed:", error)
            return false
        }
    }, [])

    // Login function
    const login = useCallback(
        async (credentials: LoginFormValues): Promise<LoginResult> => {
            setState((prev) => ({ ...prev, isLoading: true, error: null }))

            try {
                const response = await fetch(AUTH_API.LOGIN, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ...credentials,
                        deviceInfo: typeof navigator !== "undefined" ? navigator.userAgent : "",
                    }),
                    credentials: "include",
                })

                const data = await response.json()

                if (!response.ok || !data.base?.isSuccess) {
                    const errorMessage = data.base?.message || "Login failed"
                    setState((prev) => ({
                        ...prev,
                        isLoading: false,
                        error: errorMessage,
                    }))
                    return { success: false, requires2fa: false, error: errorMessage }
                }

                // Check if 2FA is required
                if (data.data?.requires2fa && !data.data?.user) {
                    setState((prev) => ({ ...prev, isLoading: false }))
                    return { success: false, requires2fa: true }
                }

                // Success
                setState({
                    user: data.data?.user || null,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                })

                return { success: true, requires2fa: false }
            } catch (error) {
                const errorMessage = "An unexpected error occurred"
                console.error("Login error:", error)
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }))
                return { success: false, requires2fa: false, error: errorMessage }
            }
        },
        []
    )

    // Logout function
    const logout = useCallback(async (): Promise<void> => {
        try {
            await fetch(AUTH_API.LOGOUT, {
                method: "POST",
                credentials: "include",
            })
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            })
            router.push("/")
            router.refresh()
        }
    }, [router])

    // Clear stale httpOnly cookies via API when both tokens are invalid
    const clearStaleTokens = useCallback(async () => {
        try {
            await fetch(AUTH_API.LOGOUT, {
                method: "POST",
                credentials: "include",
            })
        } catch {
            // Ignore errors — best effort cleanup
        }
    }, [])

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }))
    }, [])

    // Initial auth check — only manages state, never navigates
    useEffect(() => {
        if (initialUser) {
            return
        }

        const checkAuth = async () => {
            // Try fetching current user with existing access token
            const user = await fetchCurrentUser()
            if (user) {
                setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                })
                return
            }

            // Access token expired/invalid — try refreshing
            const refreshed = await refreshSession()
            if (refreshed) {
                const refreshedUser = await fetchCurrentUser()
                if (refreshedUser) {
                    setState({
                        user: refreshedUser,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    })
                    return
                }
            }

            // Not authenticated — clear stale cookies and update state
            // Navigation is handled by proxy.ts (server) and dashboard layout (client)
            await clearStaleTokens()
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            })
        }

        checkAuth()
    }, [initialUser, fetchCurrentUser, refreshSession, clearStaleTokens])

    // Set up silent token refresh
    useEffect(() => {
        if (!state.isAuthenticated) {
            return
        }

        const refreshInterval = setInterval(
            async () => {
                const success = await refreshSession()
                if (!success) {
                    // Refresh failed — update state, let dashboard guard handle redirect
                    clearInterval(refreshInterval)
                    await clearStaleTokens()
                    setState({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    })
                }
            },
            TOKEN_CONFIG.REFRESH_CHECK_INTERVAL * 10 // Check every 10 minutes
        )

        return () => clearInterval(refreshInterval)
    }, [state.isAuthenticated, refreshSession, clearStaleTokens])

    // Idle timeout — auto-logout after prolonged inactivity
    const { isWarning, remainingSeconds, resetTimer } = useIdleTimeout({
        onTimeout: logout,
        enabled: state.isAuthenticated,
    })

    const handleStayLoggedIn = useCallback(async () => {
        resetTimer()
        // Proactively refresh the token to reset backend session activity
        await refreshSession()
    }, [resetTimer, refreshSession])

    const value = useMemo<AuthContextValue>(
        () => ({
            ...state,
            login,
            logout,
            refreshSession,
            clearError,
        }),
        [state, login, logout, refreshSession, clearError]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
            <IdleTimeoutDialog
                open={isWarning}
                remainingSeconds={remainingSeconds}
                onStayLoggedIn={handleStayLoggedIn}
            />
        </AuthContext.Provider>
    )
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

/**
 * Hook to get just the user (convenience)
 */
export function useUser(): AuthUser | null {
    const { user } = useAuth()
    return user
}

/**
 * Hook to check if authenticated
 */
export function useIsAuthenticated(): boolean {
    const { isAuthenticated } = useAuth()
    return isAuthenticated
}
