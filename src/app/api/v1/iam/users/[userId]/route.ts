// IAM Users routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getUserClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ userId: string }> }

// GET /api/v1/iam/users/[userId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.getUserDetail({ userId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching user:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch user",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/users/[userId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.updateUser({ userId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating user:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update user",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/iam/users/[userId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.deleteUser({ userId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting user:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete user",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
