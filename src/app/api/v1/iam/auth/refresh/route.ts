// POST /api/v1/iam/auth/refresh - Token refresh endpoint
// Refreshes tokens using refresh token from httpOnly cookie

import { NextRequest, NextResponse } from "next/server"
import { setAuthCookiesOnResponse, clearAuthCookiesOnResponse } from "@/lib/auth/cookies"
import { getAuthClient, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const refreshToken = request.cookies.get("goapps_refresh_token")?.value

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

        const jsonResponse = NextResponse.json({
            base: response.base,
            data: {
                expiresIn: response.data?.expiresIn,
            },
        })

        // Set new tokens directly on the response (next/headers cookies().set() broken in Next.js 16.2+)
        if (response.data?.accessToken && response.data?.refreshToken) {
            setAuthCookiesOnResponse(jsonResponse, {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
                expiresIn: response.data.expiresIn,
            })
        }

        return jsonResponse
    } catch (error) {
        console.error("Token refresh error:", error)
        if (isGrpcError(error)) {
            const errResponse = handleGrpcError(error)
            clearAuthCookiesOnResponse(errResponse as NextResponse)
            return errResponse
        }
        const errResponse = NextResponse.json(
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
        clearAuthCookiesOnResponse(errResponse)
        return errResponse
    }
}
