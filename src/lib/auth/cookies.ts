// Server-side auth cookie utilities
// These functions run on the server (API routes, middleware)

import { cookies } from "next/headers"
import { AUTH_COOKIES, getCookieConfig } from "./config"

/**
 * Auth tokens structure
 */
export interface AuthTokens {
    accessToken: string
    refreshToken: string
    expiresIn: number
}

/**
 * Set authentication cookies on the server
 * Called after successful login or token refresh
 */
export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
    const cookieStore = await cookies()
    const config = getCookieConfig()

    // Calculate expiry times
    const accessTokenExpiry = tokens.expiresIn || 900 // 15 minutes default
    const refreshTokenExpiry = 7 * 24 * 60 * 60 // 7 days

    // Set access token cookie
    cookieStore.set(AUTH_COOKIES.ACCESS_TOKEN, tokens.accessToken, {
        ...config,
        maxAge: accessTokenExpiry,
    })

    // Set refresh token cookie
    cookieStore.set(AUTH_COOKIES.REFRESH_TOKEN, tokens.refreshToken, {
        ...config,
        maxAge: refreshTokenExpiry,
    })
}

/**
 * Get authentication tokens from cookies
 * Returns null if no tokens are present
 */
export async function getAuthCookies(): Promise<AuthTokens | null> {
    const cookieStore = await cookies()

    const accessToken = cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value
    const refreshToken = cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value

    if (!accessToken && !refreshToken) {
        return null
    }

    return {
        accessToken: accessToken || "",
        refreshToken: refreshToken || "",
        expiresIn: 0, // Not stored in cookie
    }
}

/**
 * Clear all authentication cookies
 * Called on logout
 */
export async function clearAuthCookies(): Promise<void> {
    const cookieStore = await cookies()
    const config = getCookieConfig()

    // Delete by setting with immediate expiry
    cookieStore.set(AUTH_COOKIES.ACCESS_TOKEN, "", {
        ...config,
        maxAge: 0,
    })

    cookieStore.set(AUTH_COOKIES.REFRESH_TOKEN, "", {
        ...config,
        maxAge: 0,
    })
}

/**
 * Check if user has valid auth cookies
 * Quick check without validating token
 */
export async function hasAuthCookies(): Promise<boolean> {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value
    const refreshToken = cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value

    return !!(accessToken || refreshToken)
}

/**
 * Get access token from cookies for API requests
 */
export async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(AUTH_COOKIES.ACCESS_TOKEN)?.value || null
}

/**
 * Get refresh token from cookies
 */
export async function getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(AUTH_COOKIES.REFRESH_TOKEN)?.value || null
}
