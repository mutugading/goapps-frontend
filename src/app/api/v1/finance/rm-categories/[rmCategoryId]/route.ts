// Finance RM Category routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getRmCategoryClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ rmCategoryId: string }> }

// GET /api/v1/finance/rm-categories/[rmCategoryId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { rmCategoryId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getRmCategoryClient()
        const response = await client.getRMCategory({ rmCategoryId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching RM Category:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch raw material category",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/rm-categories/[rmCategoryId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { rmCategoryId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getRmCategoryClient()
        const response = await client.updateRMCategory({ rmCategoryId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating RM Category:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update raw material category",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/rm-categories/[rmCategoryId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { rmCategoryId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getRmCategoryClient()
        const response = await client.deleteRMCategory({ rmCategoryId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting RM Category:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete raw material category",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
