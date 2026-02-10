// POST /api/v1/iam/auth/logout - Logout endpoint
// Clears auth cookies and invalidates session on backend

import { NextRequest, NextResponse } from "next/server"
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies"
import { getAuthClient, createAuthMetadata } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const refreshToken = await getRefreshToken()

        // Call backend logout to invalidate session
        if (refreshToken) {
            try {
                const accessToken = request.cookies.get("goapps_access_token")?.value
                const metadata = accessToken ? createAuthMetadata(accessToken) : undefined
                const client = getAuthClient()
                await client.logout({ refreshToken }, metadata)
            } catch {
                // Continue with cookie cleanup even if backend call fails
                console.warn("Backend logout failed, continuing with cookie cleanup")
            }
        }

        // Clear auth cookies
        await clearAuthCookies()

        return NextResponse.json({
            base: {
                isSuccess: true,
                statusCode: "200",
                message: "Logged out successfully",
                validationErrors: [],
            },
        })
    } catch (error) {
        console.error("Logout error:", error)
        // Still try to clear cookies even on error
        try {
            await clearAuthCookies()
        } catch {
            // Ignore cleanup errors
        }

        return NextResponse.json({
            base: {
                isSuccess: true,
                statusCode: "200",
                message: "Logged out",
                validationErrors: [],
            },
        })
    }
}
