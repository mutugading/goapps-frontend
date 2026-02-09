// POST /api/v1/iam/auth/2fa/verify - Verify 2FA setup
// Confirms 2FA is enabled after user enters TOTP code

import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { SERVICES, getBackendUrl } from "@/lib/api/proxy"

// Backend response type (snake_case from gRPC-gateway)
interface BackendVerify2FAResponse {
    base: {
        validation_errors: Array<{ field: string; message: string }>
        status_code: string
        is_success: boolean
        message: string
    }
}

export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const backendUrl = getBackendUrl(SERVICES.IAM)

        // Convert frontend camelCase to backend snake_case
        const backendBody = {
            totp_code: body.totpCode,
        }

        const response = await fetch(`${backendUrl}/api/v1/iam/auth/2fa/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(backendBody),
        })

        const data: BackendVerify2FAResponse = await response.json()

        // Convert snake_case to camelCase for frontend
        return NextResponse.json({
            base: {
                isSuccess: data.base?.is_success ?? false,
                statusCode: data.base?.status_code || String(response.status),
                message: data.base?.message || "",
                validationErrors: data.base?.validation_errors || [],
            },
        }, { status: response.status })
    } catch (error) {
        console.error("Verify 2FA error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to verify 2FA",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

