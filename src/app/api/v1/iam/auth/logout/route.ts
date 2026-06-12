// POST /api/v1/iam/auth/logout - Logout endpoint
// Clears auth cookies and invalidates session on backend

import { NextRequest, NextResponse } from "next/server"
import { clearAuthCookiesOnResponse } from "@/lib/auth/cookies"
import { getAuthClient, createAuthMetadata } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    const refreshToken = request.cookies.get("goapps_refresh_token")?.value

    // Call backend logout to invalidate session
    if (refreshToken) {
        try {
            const accessToken = request.cookies.get("goapps_access_token")?.value
            const metadata = accessToken ? createAuthMetadata(accessToken) : undefined
            const client = getAuthClient()
            await client.logout({ refreshToken }, metadata)
        } catch {
            console.warn("Backend logout failed, continuing with cookie cleanup")
        }
    }

    const jsonResponse = NextResponse.json({
        base: {
            isSuccess: true,
            statusCode: "200",
            message: "Logged out successfully",
            validationErrors: [],
        },
    })

    // Clear cookies directly on the response (next/headers cookies().set() broken in Next.js 16.2+)
    clearAuthCookiesOnResponse(jsonResponse)

    return jsonResponse
}
