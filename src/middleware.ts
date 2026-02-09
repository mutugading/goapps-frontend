// Next.js Middleware for route protection
// Protects authenticated routes and redirects accordingly

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIES, AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/auth/config"

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the request is for a public route
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

    // Check if the request is for an API route (except auth-related)
    const isApiRoute = pathname.startsWith("/api/")

    // Check if user has auth cookies
    const hasAccessToken = request.cookies.has(AUTH_COOKIES.ACCESS_TOKEN)
    const hasRefreshToken = request.cookies.has(AUTH_COOKIES.REFRESH_TOKEN)
    const isAuthenticated = hasAccessToken || hasRefreshToken

    // Static files and API routes - skip middleware
    if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/static/") ||
        pathname.includes(".")
    ) {
        return NextResponse.next()
    }

    // API routes - let them handle their own auth
    if (isApiRoute) {
        return NextResponse.next()
    }

    // Public routes (login, forgot password, etc.)
    if (isPublicRoute) {
        // If already authenticated and trying to access login, redirect to dashboard
        if (isAuthenticated && pathname === AUTH_ROUTES.LOGIN) {
            return NextResponse.redirect(new URL(AUTH_ROUTES.DASHBOARD, request.url))
        }
        return NextResponse.next()
    }

    // Protected routes - require authentication
    if (!isAuthenticated) {
        // Store the original URL to redirect back after login
        const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        "/((?!_next/static|_next/image|favicon.ico|public).*)",
    ],
}
