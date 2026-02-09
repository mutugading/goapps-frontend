// POST /api/v1/iam/auth/refresh - Token refresh endpoint
// Refreshes tokens using refresh token from httpOnly cookie

import { NextRequest, NextResponse } from "next/server"
import { setAuthCookies, getRefreshToken, clearAuthCookies } from "@/lib/auth/cookies"
import { SERVICES, getBackendUrl } from "@/lib/api/proxy"

// Backend response type (snake_case from gRPC-gateway)
interface BackendRefreshResponse {
    base: {
        validation_errors: Array<{ field: string; message: string }>
        status_code: string
        is_success: boolean
        message: string
    }
    data?: {
        access_token: string
        refresh_token: string
        expires_in: string | number
        token_type: string
    }
}

export async function POST(request: NextRequest) {
    try {
        const refreshToken = await getRefreshToken()

        if (!refreshToken) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "401",
                        message: "No refresh token available",
                        validationErrors: [],
                    },
                },
                { status: 401 }
            )
        }

        const backendUrl = getBackendUrl(SERVICES.IAM)

        // Call backend to refresh tokens (use snake_case)
        const response = await fetch(`${backendUrl}/api/v1/iam/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        })

        const data: BackendRefreshResponse = await response.json()

        // If refresh failed, clear cookies and return error
        if (!response.ok || !data.base?.is_success) {
            await clearAuthCookies()
            return NextResponse.json({
                base: {
                    isSuccess: false,
                    statusCode: data.base?.status_code || String(response.status),
                    message: data.base?.message || "Token refresh failed",
                    validationErrors: data.base?.validation_errors || [],
                },
            }, { status: response.status })
        }

        // Set new tokens in cookies
        if (data.data?.access_token && data.data?.refresh_token) {
            const expiresIn = typeof data.data.expires_in === "string"
                ? parseInt(data.data.expires_in, 10)
                : data.data.expires_in

            await setAuthCookies({
                accessToken: data.data.access_token,
                refreshToken: data.data.refresh_token,
                expiresIn,
            })
        }

        return NextResponse.json({
            base: {
                isSuccess: true,
                statusCode: "200",
                message: data.base.message,
                validationErrors: [],
            },
            data: {
                expiresIn: data.data?.expires_in,
            },
        })
    } catch (error) {
        console.error("Token refresh error:", error)
        // Clear cookies on error to force re-login
        try {
            await clearAuthCookies()
        } catch {
            // Ignore cleanup errors
        }

        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to refresh token",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

