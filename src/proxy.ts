// Next.js Proxy for route protection (Next.js 16+)
// Protects authenticated routes and redirects accordingly
// Note: In Next.js 16, middleware.ts was replaced with proxy.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { AUTH_COOKIES, AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/auth/config"

// Default export is required for Next.js 16 proxy
export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the request is for a public route
    // Use exact match for "/" to avoid matching all paths
    const isPublicRoute = PUBLIC_ROUTES.some((route) =>
        route === "/" ? pathname === "/" : pathname.startsWith(route)
    )

    // Check if the request is for an API route (except auth-related)
    const isApiRoute = pathname.startsWith("/api/")

    // Check if user has auth cookies
    const hasAccessToken = request.cookies.has(AUTH_COOKIES.ACCESS_TOKEN)
    const hasRefreshToken = request.cookies.has(AUTH_COOKIES.REFRESH_TOKEN)
    const isAuthenticated = hasAccessToken || hasRefreshToken

    // Static files and API routes - skip proxy
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

    // Public routes (landing, login, forgot password, etc.)
    // Note: We intentionally do NOT auto-redirect /login → /dashboard when
    // cookies are present. Cookies (especially the refresh token) can outlive
    // a usable session — if the access token has expired and the user state
    // isn't loaded yet, the dashboard layout will bounce back to `/` causing
    // a visible glitch. The LoginPage handles the redirect itself based on
    // real client-side auth state once it mounts.
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Protected routes - require authentication
    if (!isAuthenticated) {
        // Redirect to landing page
        return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
}

// Routes Proxy should not run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api routes (handled separately)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (.png, etc)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
    ],
}
