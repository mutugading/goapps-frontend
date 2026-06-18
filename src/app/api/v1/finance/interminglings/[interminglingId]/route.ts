// Finance Intermingling routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getInterminglingClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ interminglingId: string }> }

// GET /api/v1/finance/interminglings/[interminglingId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { interminglingId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getInterminglingClient()
        const response = await client.getIntermingling({ intmId: interminglingId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching Intermingling:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch intermingling",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/interminglings/[interminglingId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { interminglingId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getInterminglingClient()
        const response = await client.updateIntermingling(
            { ...body, intmId: interminglingId },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating Intermingling:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update intermingling",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/interminglings/[interminglingId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { interminglingId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getInterminglingClient()
        const response = await client.deleteIntermingling({ intmId: interminglingId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting Intermingling:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete intermingling",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
