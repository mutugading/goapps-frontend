// POST /api/v1/iam/auth/logout - Logout endpoint
// Clears auth cookies and invalidates session on backend

import { NextRequest, NextResponse } from "next/server"
import { clearAuthCookies, getRefreshToken } from "@/lib/auth/cookies"
import { SERVICES, getBackendUrl, getForwardHeaders } from "@/lib/api/proxy"

export async function POST(request: NextRequest) {
    try {
        const backendUrl = getBackendUrl(SERVICES.IAM)
        const refreshToken = await getRefreshToken()

        // Call backend logout to invalidate session
        if (refreshToken) {
            try {
                await fetch(`${backendUrl}/api/v1/iam/auth/logout`, {
                    method: "POST",
                    headers: getForwardHeaders(request),
                    body: JSON.stringify({ refreshToken }),
                })
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
