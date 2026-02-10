// Finance UOM routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getUomClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ uomId: string }> }

// GET /api/v1/finance/uoms/[uomId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { uomId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUomClient()
        const response = await client.getUOM({ uomId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching UOM:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch unit of measure",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/uoms/[uomId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { uomId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getUomClient()
        const response = await client.updateUOM({ uomId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating UOM:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update unit of measure",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/uoms/[uomId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { uomId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUomClient()
        const response = await client.deleteUOM({ uomId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting UOM:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete unit of measure",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
