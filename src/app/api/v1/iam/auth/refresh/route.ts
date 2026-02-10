// POST /api/v1/iam/auth/refresh - Token refresh endpoint
// Refreshes tokens using refresh token from httpOnly cookie

import { NextResponse } from "next/server"
import { setAuthCookies, getRefreshToken, clearAuthCookies } from "@/lib/auth/cookies"
import { getAuthClient, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST() {
    try {
        const refreshToken = await getRefreshToken()

        if (!refreshToken) {
            return NextResponse.json(
                {
                    base: {
                        isSuccess: false,
                        statusCode: "401",
                        message: "No refresh token available",
                        validationErrors: [],
                    },
                },
                { status: 401 }
            )
        }

        const client = getAuthClient()
        const response = await client.refreshToken({ refreshToken })

        // Set new tokens in cookies
        if (response.data?.accessToken && response.data?.refreshToken) {
            await setAuthCookies({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
                expiresIn: response.data.expiresIn,
            })
        }

        return NextResponse.json({
            base: response.base,
            data: {
                expiresIn: response.data?.expiresIn,
            },
        })
    } catch (error) {
        console.error("Token refresh error:", error)
        // Clear cookies on error to force re-login
        try {
            await clearAuthCookies()
        } catch {
            // Ignore cleanup errors
        }

        if (isGrpcError(error)) return handleGrpcError(error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to refresh token",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
