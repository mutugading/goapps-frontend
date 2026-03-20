// IAM Users Detail routes - Update user detail (employee info)

import { NextRequest, NextResponse } from "next/server"
import { getUserClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ userId: string }> }

// PUT /api/v1/iam/users/[userId]/detail
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.updateUserDetail({ userId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating user detail:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update user detail",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
