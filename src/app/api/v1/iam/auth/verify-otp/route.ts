// POST /api/v1/iam/auth/verify-otp - Verify OTP code

import { NextRequest, NextResponse } from "next/server"
import { getAuthClient, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const client = getAuthClient()
        const response = await client.verifyResetOTP({
            email: body.email,
            otpCode: body.otpCode,
        })

        return NextResponse.json({
            base: response.base,
            resetToken: response.resetToken,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
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
