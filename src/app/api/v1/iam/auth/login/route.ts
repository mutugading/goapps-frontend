// POST /api/v1/iam/auth/login - Login endpoint
// Handles authentication and sets httpOnly cookies

import { NextRequest, NextResponse } from "next/server"
import { setAuthCookiesOnResponse } from "@/lib/auth/cookies"
import { getAuthClient, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const client = getAuthClient()

        const response = await client.login({
            username: body.username,
            password: body.password,
            totpCode: body.totpCode || "",
            deviceInfo: body.deviceInfo ? String(body.deviceInfo).slice(0, 100) : "",
        })

        // If 2FA is required but not provided, return response without setting cookies
        if (response.data?.requires2fa && !response.data.accessToken) {
            return NextResponse.json({
                base: {
                    isSuccess: true,
                    statusCode: "200",
                    message: "2FA required",
                    validationErrors: [],
                },
                data: {
                    requires2fa: true,
                    user: null,
                },
            })
        }

        // Return user info WITHOUT tokens (tokens go in httpOnly cookies)
        const jsonResponse = NextResponse.json({
            base: response.base,
            data: {
                user: response.data?.user ?? null,
                requires2fa: response.data?.requires2fa || false,
                requiresEmailVerification: response.data?.requiresEmailVerification || false,
                expiresIn: response.data?.expiresIn,
            },
        })

        // Set auth cookies directly on the response (next/headers cookies().set() is broken in Next.js 16.2+)
        if (response.data?.accessToken && response.data?.refreshToken) {
            setAuthCookiesOnResponse(jsonResponse, {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
                expiresIn: response.data.expiresIn,
            })
        }

        return jsonResponse
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Login error:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Internal server error during login",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
