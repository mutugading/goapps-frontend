// POST /api/v1/iam/auth/reset-password - Set new password
// Uses reset token from OTP verification

import { NextRequest, NextResponse } from "next/server"
import { SERVICES, getBackendUrl } from "@/lib/api/proxy"

// Backend response type (snake_case from gRPC-gateway)
interface BackendResetPasswordResponse {
    base: {
        validation_errors: Array<{ field: string; message: string }>
        status_code: string
        is_success: boolean
        message: string
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const backendUrl = getBackendUrl(SERVICES.IAM)

        // Convert frontend camelCase to backend snake_case
        const backendBody = {
            reset_token: body.resetToken,
            new_password: body.newPassword,
            confirm_password: body.confirmPassword,
        }

        const response = await fetch(`${backendUrl}/api/v1/iam/auth/reset-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(backendBody),
        })

        const data: BackendResetPasswordResponse = await response.json()

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
        console.error("Reset password error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to reset password",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

