// POST /api/v1/iam/auth/2fa/enable - Enable 2FA
// Initiates 2FA setup and returns TOTP secret and QR code

import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { SERVICES, getBackendUrl } from "@/lib/api/proxy"

// Backend response type (snake_case from gRPC-gateway)
interface BackendEnable2FAResponse {
    base: {
        validation_errors: Array<{ field: string; message: string }>
        status_code: string
        is_success: boolean
        message: string
    }
    data?: {
        secret: string
        qr_code_url: string
        recovery_codes: string[]
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

        const response = await fetch(`${backendUrl}/api/v1/iam/auth/2fa/enable`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        })

        const data: BackendEnable2FAResponse = await response.json()

        // Convert snake_case to camelCase for frontend
        return NextResponse.json({
            base: {
                isSuccess: data.base?.is_success ?? false,
                statusCode: data.base?.status_code || String(response.status),
                message: data.base?.message || "",
                validationErrors: data.base?.validation_errors || [],
            },
            data: data.data ? {
                secret: data.data.secret,
                qrCodeUrl: data.data.qr_code_url,
                recoveryCodes: data.data.recovery_codes,
            } : null,
        }, { status: response.status })
    } catch (error) {
        console.error("Enable 2FA error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to enable 2FA",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

