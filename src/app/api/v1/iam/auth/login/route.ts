// POST /api/v1/iam/auth/login - Login endpoint
// Handles authentication and sets httpOnly cookies

import { NextRequest, NextResponse } from "next/server"
import { setAuthCookies } from "@/lib/auth/cookies"
import { SERVICES, getBackendUrl } from "@/lib/api/proxy"

// Backend response types (snake_case from gRPC-gateway)
interface BackendLoginResponse {
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
        user: {
            user_id: string
            username: string
            email: string
            full_name: string
            profile_picture_url: string
            roles: string[]
            permissions: string[]
            two_factor_enabled: boolean
        }
        requires_2fa: boolean
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const backendUrl = getBackendUrl(SERVICES.IAM)

        // Convert frontend camelCase to backend snake_case
        // Only include totp_code and device_info if they have values
        // (protobuf IGNORE_IF_ZERO_VALUE requires field to be omitted, not empty string)
        const backendBody: Record<string, string> = {
            username: body.username,
            password: body.password,
        }

        if (body.totpCode) {
            backendBody.totp_code = body.totpCode
        }

        if (body.deviceInfo) {
            // Truncate to 100 chars max (proto validation limit)
            backendBody.device_info = String(body.deviceInfo).slice(0, 100)
        }

        // Forward login request to IAM backend
        const response = await fetch(`${backendUrl}/api/v1/iam/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(backendBody),
        })

        const data: BackendLoginResponse = await response.json()

        // If login failed, return the error response (convert to camelCase)
        if (!response.ok || !data.base?.is_success) {
            return NextResponse.json({
                base: {
                    isSuccess: false,
                    statusCode: data.base?.status_code || String(response.status),
                    message: data.base?.message || "Login failed",
                    validationErrors: data.base?.validation_errors || [],
                },
            }, { status: response.status })
        }

        // If 2FA is required but not provided, return response without setting cookies
        if (data.data?.requires_2fa && !data.data.access_token) {
            return NextResponse.json({
                base: {
                    isSuccess: true,
                    statusCode: "200",
                    message: "2FA required",
                    validationErrors: [],
                },
                data: {
                    requires2fa: true,
                    user: null,
                },
            })
        }

        // Set auth cookies with tokens from backend
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

        // Return user info WITHOUT tokens (tokens are in httpOnly cookies)
        // Convert snake_case to camelCase for frontend
        return NextResponse.json({
            base: {
                isSuccess: true,
                statusCode: "200",
                message: data.base.message,
                validationErrors: [],
            },
            data: {
                user: data.data?.user ? {
                    userId: data.data.user.user_id,
                    username: data.data.user.username,
                    email: data.data.user.email,
                    fullName: data.data.user.full_name,
                    profilePictureUrl: data.data.user.profile_picture_url,
                    roles: data.data.user.roles,
                    permissions: data.data.user.permissions,
                    twoFactorEnabled: data.data.user.two_factor_enabled,
                } : null,
                requires2fa: data.data?.requires_2fa || false,
                expiresIn: data.data?.expires_in,
            },
        })
    } catch (error) {
        console.error("Login error:", error)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        console.error("Login error details:", {
            name: error instanceof Error ? error.name : "Unknown",
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
        })
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: `Internal server error during login: ${errorMessage}`,
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

