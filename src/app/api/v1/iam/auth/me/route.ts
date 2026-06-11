// GET /api/v1/iam/auth/me - Get current user endpoint
// Returns authenticated user info using access token from cookie

import { NextRequest, NextResponse } from "next/server"
import { getAuthClient, createAuthMetadata, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const accessToken = request.cookies.get("goapps_access_token")?.value

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
        const response = await client.getCurrentUser({}, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data ?? null,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Get current user error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to get user info",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
