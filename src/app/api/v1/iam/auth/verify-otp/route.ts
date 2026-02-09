// POST /api/v1/iam/auth/verify-otp - Verify OTP code
// Returns reset token for password reset

import { NextRequest, NextResponse } from "next/server"
import { SERVICES, getBackendUrl } from "@/lib/api/proxy"

// Backend response type (snake_case from gRPC-gateway)
interface BackendVerifyOTPResponse {
    base: {
        validation_errors: Array<{ field: string; message: string }>
        status_code: string
        is_success: boolean
        message: string
    }
    reset_token?: string
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const backendUrl = getBackendUrl(SERVICES.IAM)

        // Convert frontend camelCase to backend snake_case
        const backendBody = {
            email: body.email,
            otp_code: body.otpCode,
        }

        const response = await fetch(`${backendUrl}/api/v1/iam/auth/verify-otp`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(backendBody),
        })

        const data: BackendVerifyOTPResponse = await response.json()

        // Convert snake_case to camelCase for frontend
        return NextResponse.json({
            base: {
                isSuccess: data.base?.is_success ?? false,
                statusCode: data.base?.status_code || String(response.status),
                message: data.base?.message || "",
                validationErrors: data.base?.validation_errors || [],
            },
            resetToken: data.reset_token,
        }, { status: response.status })
    } catch (error) {
        console.error("Verify OTP error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to verify OTP",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

