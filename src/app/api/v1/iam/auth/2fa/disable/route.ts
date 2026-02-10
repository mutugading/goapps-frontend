// POST /api/v1/iam/auth/2fa/disable - Disable 2FA

import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { getAuthClient, createAuthMetadata, isGrpcError, handleGrpcError } from "@/lib/grpc"

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
        const metadata = createAuthMetadata(accessToken)
        const client = getAuthClient()
        const response = await client.disable2FA(
            {
                password: body.password,
                verificationCode: body.verificationCode,
            },
            metadata
        )

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Disable 2FA error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to disable 2FA",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
