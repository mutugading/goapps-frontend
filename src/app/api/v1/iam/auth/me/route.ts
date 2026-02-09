// GET /api/v1/iam/auth/me - Get current user endpoint
// Returns authenticated user info using access token from cookie

import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { SERVICES, getBackendUrl } from "@/lib/api/proxy"

// Backend response type (snake_case from gRPC-gateway)
interface BackendGetUserResponse {
    base: {
        validation_errors: Array<{ field: string; message: string }>
        status_code: string
        is_success: boolean
        message: string
    }
    data?: {
        user_id: string
        username: string
        email: string
        full_name: string
        profile_picture_url: string
        roles: string[]
        permissions: string[]
        two_factor_enabled: boolean
    }
}

export async function GET(request: NextRequest) {
    try {
        const accessToken = await getAccessToken()

        if (!accessToken) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "401",
                        message: "Not authenticated",
                        validationErrors: [],
                    },
                },
                { status: 401 }
            )
        }

        const backendUrl = getBackendUrl(SERVICES.IAM)

        // Call backend with access token
        const response = await fetch(`${backendUrl}/api/v1/iam/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        })

        const data: BackendGetUserResponse = await response.json()

        if (!response.ok || !data.base?.is_success) {
            return NextResponse.json({
                base: {
                    isSuccess: false,
                    statusCode: data.base?.status_code || String(response.status),
                    message: data.base?.message || "Failed to get user",
                    validationErrors: data.base?.validation_errors || [],
                },
            }, { status: response.status })
        }

        // Convert snake_case to camelCase for frontend
        return NextResponse.json({
            base: {
                isSuccess: true,
                statusCode: "200",
                message: data.base.message,
                validationErrors: [],
            },
            data: data.data ? {
                userId: data.data.user_id,
                username: data.data.username,
                email: data.data.email,
                fullName: data.data.full_name,
                profilePictureUrl: data.data.profile_picture_url,
                roles: data.data.roles,
                permissions: data.data.permissions,
                twoFactorEnabled: data.data.two_factor_enabled,
            } : null,
        })
    } catch (error) {
        console.error("Get current user error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to get user info",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

