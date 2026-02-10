// POST /api/v1/iam/auth/forgot-password - Initiate password reset

import { NextRequest, NextResponse } from "next/server"
import { getAuthClient, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const client = getAuthClient()
        const response = await client.forgotPassword({ email: body.email })

        return NextResponse.json({
            base: response.base,
            message: response.message,
            expiresIn: response.expiresIn,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
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
