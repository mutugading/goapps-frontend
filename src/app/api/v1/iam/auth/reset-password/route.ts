// POST /api/v1/iam/auth/reset-password - Set new password

import { NextRequest, NextResponse } from "next/server"
import { getAuthClient, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const client = getAuthClient()
        const response = await client.resetPassword({
            resetToken: body.resetToken,
            newPassword: body.newPassword,
            confirmPassword: body.confirmPassword,
        })

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
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
