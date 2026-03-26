// Auth configuration constants
// Centralized configuration for authentication settings

/**
 * Cookie names for authentication tokens
 */
export const AUTH_COOKIES = {
    ACCESS_TOKEN: "goapps_access_token",
    REFRESH_TOKEN: "goapps_refresh_token",
    USER_INFO: "goapps_user_info",
} as const

/**
 * Cookie configuration based on environment
 */
export function getCookieConfig() {
    const isProduction = process.env.NODE_ENV === "production"
    const isStaging = process.env.NEXT_PUBLIC_APP_URL?.includes("staging")

    // Domain configuration for cookies
    // In production/staging, use the root domain for cookie sharing
    let domain: string | undefined

    if (isProduction || isStaging) {
        // Extract domain from app URL (e.g., .mutugading.com)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
        try {
            const url = new URL(appUrl)
            // Use parent domain for cookie sharing across subdomains
            const parts = url.hostname.split(".")
            if (parts.length >= 2) {
                domain = `.${parts.slice(-2).join(".")}`
            }
        } catch {
            // Fallback: don't set domain (will use current host)
        }
    }

    return {
        httpOnly: true,
        secure: isProduction || isStaging,
        sameSite: "lax" as const,
        path: "/",
        domain,
    }
}

/**
 * Token expiry configuration (in seconds)
 */
export const TOKEN_CONFIG = {
    // Refresh token before it expires (5 minutes before expiry)
    REFRESH_BUFFER_SECONDS: 5 * 60,
    // Default access token expiry if not provided by backend
    DEFAULT_ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes
    // Refresh interval check (in milliseconds)
    REFRESH_CHECK_INTERVAL: 60 * 1000, // 1 minute
} as const

/**
 * Idle timeout configuration (in milliseconds)
 * Must match backend security.session_idle_timeout (default: 2h)
 */
export const IDLE_CONFIG = {
    // Total idle timeout — must match backend session_idle_timeout
    TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
    // Show warning dialog this many ms before timeout
    WARNING_BEFORE: 5 * 60 * 1000, // 5 minutes before timeout
    // How often to check idle status (ms)
    CHECK_INTERVAL: 60 * 1000, // every 1 minute
    // User activity events to track
    ACTIVITY_EVENTS: ["mousedown", "keydown", "scroll", "touchstart"] as const,
} as const

/**
 * Auth routes configuration
 */
export const AUTH_ROUTES = {
    LOGIN: "/login",
    LOGOUT: "/logout",
    FORGOT_PASSWORD: "/forgot-password",
    VERIFY_OTP: "/verify-otp",
    RESET_PASSWORD: "/reset-password",
    DASHBOARD: "/dashboard",
} as const

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
    "/",
    "/privacy",
    "/terms",
    AUTH_ROUTES.LOGIN,
    AUTH_ROUTES.FORGOT_PASSWORD,
    AUTH_ROUTES.VERIFY_OTP,
    AUTH_ROUTES.RESET_PASSWORD,
    "/api/v1/iam/auth/login",
    "/api/v1/iam/auth/forgot-password",
    "/api/v1/iam/auth/verify-otp",
    "/api/v1/iam/auth/reset-password",
    "/api/v1/iam/auth/refresh",
] as const

/**
 * API endpoints for authentication
 */
export const AUTH_API = {
    LOGIN: "/api/v1/iam/auth/login",
    LOGOUT: "/api/v1/iam/auth/logout",
    REFRESH: "/api/v1/iam/auth/refresh",
    ME: "/api/v1/iam/auth/me",
    FORGOT_PASSWORD: "/api/v1/iam/auth/forgot-password",
    VERIFY_OTP: "/api/v1/iam/auth/verify-otp",
    RESET_PASSWORD: "/api/v1/iam/auth/reset-password",
    UPDATE_PASSWORD: "/api/v1/iam/auth/update-password",
    ENABLE_2FA: "/api/v1/iam/auth/2fa/enable",
    VERIFY_2FA: "/api/v1/iam/auth/2fa/verify",
    DISABLE_2FA: "/api/v1/iam/auth/2fa/disable",
} as const
