// PUT /api/v1/iam/users/me/detail - Update current authenticated user's profile detail

import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/auth/cookies"
import { getUserClient, createAuthMetadata, isGrpcError, handleGrpcError } from "@/lib/grpc"
import { jwtDecode } from "jwt-decode"

interface JwtPayload {
    sub: string
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

        const body = await request.json()
        const metadata = createAuthMetadata(accessToken)
        const client = getUserClient()
        const response = await client.updateUserDetail(
            {
                userId,
                employeeCode: body.employeeCode,
                fullName: body.fullName,
                firstName: body.firstName,
                lastName: body.lastName,
                sectionId: body.sectionId,
                phone: body.phone,
                profilePictureUrl: body.profilePictureUrl,
                position: body.position,
                dateOfBirth: body.dateOfBirth,
                address: body.address,
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data ?? null,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
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
