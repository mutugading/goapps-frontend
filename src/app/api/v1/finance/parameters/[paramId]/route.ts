// Finance Parameter routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getParameterClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ paramId: string }> }

// GET /api/v1/finance/parameters/[paramId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { paramId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getParameterClient()
        const response = await client.getParameter({ paramId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching Parameter:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch parameter",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/parameters/[paramId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { paramId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getParameterClient()
        const response = await client.updateParameter({ paramId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating Parameter:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update parameter",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/parameters/[paramId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { paramId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getParameterClient()
        const response = await client.deleteParameter({ paramId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting Parameter:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete parameter",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
