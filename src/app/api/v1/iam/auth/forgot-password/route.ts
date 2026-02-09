// POST /api/v1/iam/auth/forgot-password - Initiate password reset
// Sends OTP to user's email

import { NextRequest, NextResponse } from "next/server"
import { SERVICES, getBackendUrl } from "@/lib/api/proxy"

// Backend response type (snake_case from gRPC-gateway)
interface BackendForgotPasswordResponse {
    base: {
        validation_errors: Array<{ field: string; message: string }>
        status_code: string
        is_success: boolean
        message: string
    }
    message?: string
    expires_in?: number
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const backendUrl = getBackendUrl(SERVICES.IAM)

        const response = await fetch(`${backendUrl}/api/v1/iam/auth/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        })

        const data: BackendForgotPasswordResponse = await response.json()

        // Convert snake_case to camelCase for frontend
        return NextResponse.json({
            base: {
                isSuccess: data.base?.is_success ?? false,
                statusCode: data.base?.status_code || String(response.status),
                message: data.base?.message || "",
                validationErrors: data.base?.validation_errors || [],
            },
            message: data.message,
            expiresIn: data.expires_in,
        }, { status: response.status })
    } catch (error) {
        console.error("Forgot password error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to send password reset email",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

