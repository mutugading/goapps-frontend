// PUT /api/v1/iam/users/me/detail - Update current authenticated user's profile detail

import { NextRequest, NextResponse } from "next/server"
import { SERVICES, getBackendUrl, getForwardHeaders } from "@/lib/api/proxy"
import { getAccessToken } from "@/lib/auth/cookies"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
    sub: string // user_id
    username: string
    exp: number
}

export async function PUT(request: NextRequest) {
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

        // Get request body
        const body = await request.json()

        // Convert camelCase to snake_case for backend
        const backendBody: Record<string, unknown> = {
            user_id: userId,
        }

        if (body.employeeCode !== undefined) backendBody.employee_code = body.employeeCode
        if (body.fullName !== undefined) backendBody.full_name = body.fullName
        if (body.firstName !== undefined) backendBody.first_name = body.firstName
        if (body.lastName !== undefined) backendBody.last_name = body.lastName
        if (body.sectionId !== undefined) backendBody.section_id = body.sectionId
        if (body.phone !== undefined) backendBody.phone = body.phone
        if (body.profilePictureUrl !== undefined) backendBody.profile_picture_url = body.profilePictureUrl
        if (body.position !== undefined) backendBody.position = body.position
        if (body.dateOfBirth !== undefined) backendBody.date_of_birth = body.dateOfBirth
        if (body.address !== undefined) backendBody.address = body.address

        // Update user detail in IAM backend
        const backendUrl = getBackendUrl(SERVICES.IAM)
        const response = await fetch(`${backendUrl}/api/v1/iam/users/${userId}/detail`, {
            method: "PUT",
            headers: getForwardHeaders(request),
            body: JSON.stringify(backendBody),
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
                        detailId: data.data.detail_id,
                        userId: data.data.user_id,
                        sectionId: data.data.section_id,
                        section: data.data.section,
                        employeeCode: data.data.employee_code,
                        fullName: data.data.full_name,
                        firstName: data.data.first_name,
                        lastName: data.data.last_name,
                        phone: data.data.phone,
                        profilePictureUrl: data.data.profile_picture_url,
                        position: data.data.position,
                        dateOfBirth: data.data.date_of_birth,
                        address: data.data.address,
                        audit: data.data.audit,
                    }
                    : null,
            },
            { status: response.status }
        )
    } catch (error) {
        console.error("Error updating user profile:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update user profile",
                    validationErrors: [],
                },
                data: null,
            },
            { status: 500 }
        )
    }
}
