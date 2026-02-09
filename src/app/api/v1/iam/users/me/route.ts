// GET /api/v1/iam/users/me - Get current authenticated user profile
// This is a convenience endpoint that uses the access token to get user's own profile

import { NextRequest, NextResponse } from "next/server"
import { SERVICES, getBackendUrl, getForwardHeaders } from "@/lib/api/proxy"
import { getAccessToken } from "@/lib/auth/cookies"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
    sub: string // user_id
    username: string
    exp: number
}

export async function GET(request: NextRequest) {
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

        // Get user detail from IAM backend
        const backendUrl = getBackendUrl(SERVICES.IAM)
        const response = await fetch(`${backendUrl}/api/v1/iam/users/${userId}/detail`, {
            method: "GET",
            headers: getForwardHeaders(request),
        })

        const data = await response.json()

        // Convert snake_case to camelCase for frontend
        return NextResponse.json(
            {
                base: {
                    isSuccess: data.base?.is_success ?? false,
                    statusCode: data.base?.status_code || String(response.status),
                    message: data.base?.message || "",
                    validationErrors: data.base?.validation_errors || [],
                },
                data: data.data
                    ? {
                        user: data.data.user
                            ? {
                                userId: data.data.user.user_id,
                                username: data.data.user.username,
                                email: data.data.user.email,
                                isActive: data.data.user.is_active,
                                isLocked: data.data.user.is_locked,
                                twoFactorEnabled: data.data.user.two_factor_enabled,
                                lastLoginAt: data.data.user.last_login_at,
                                audit: data.data.user.audit,
                            }
                            : null,
                        detail: data.data.detail
                            ? {
                                detailId: data.data.detail.detail_id,
                                userId: data.data.detail.user_id,
                                sectionId: data.data.detail.section_id,
                                section: data.data.detail.section,
                                employeeCode: data.data.detail.employee_code,
                                fullName: data.data.detail.full_name,
                                firstName: data.data.detail.first_name,
                                lastName: data.data.detail.last_name,
                                phone: data.data.detail.phone,
                                profilePictureUrl: data.data.detail.profile_picture_url,
                                position: data.data.detail.position,
                                dateOfBirth: data.data.detail.date_of_birth,
                                address: data.data.detail.address,
                                audit: data.data.detail.audit,
                            }
                            : null,
                        roleCodes: data.data.role_codes || [],
                    }
                    : null,
            },
            { status: response.status }
        )
    } catch (error) {
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
