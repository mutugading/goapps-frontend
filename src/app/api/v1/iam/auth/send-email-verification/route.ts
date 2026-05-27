// POST /api/v1/iam/auth/send-email-verification - Send email verification code

import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { getAuthClient, createAuthMetadata, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST() {
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

        const metadata = createAuthMetadata(accessToken)
        const client = getAuthClient()
        const response = await client.sendEmailVerification({}, metadata)

        return NextResponse.json({
            base: response.base,
            message: response.message,
            expiresIn: response.expiresIn,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Send email verification error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to send verification email",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
