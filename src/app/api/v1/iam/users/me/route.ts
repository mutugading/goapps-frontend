// GET /api/v1/iam/users/me - Get current authenticated user profile

import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { getUserClient, createAuthMetadata, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
    sub: string
    username: string
    exp: number
}

export async function GET() {
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
                    data: null,
                },
                { status: 401 }
            )
        }

        // Decode JWT to get user_id
        let userId: string
        try {
            const decoded = jwtDecode<JwtPayload>(accessToken)
            userId = decoded.sub
        } catch {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "401",
                        message: "Invalid token",
                        validationErrors: [],
                    },
                    data: null,
                },
                { status: 401 }
            )
        }

        const metadata = createAuthMetadata(accessToken)
        const client = getUserClient()
        const response = await client.getUserDetail({ userId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data ?? null,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching user profile:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch user profile",
                    validationErrors: [],
                },
                data: null,
            },
            { status: 500 }
        )
    }
}
