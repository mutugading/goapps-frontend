// Finance UOM Category routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getUomCategoryClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ uomCategoryId: string }> }

// GET /api/v1/finance/uom-categories/[uomCategoryId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { uomCategoryId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUomCategoryClient()
        const response = await client.getUOMCategory({ uomCategoryId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching UOM Category:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch UOM category",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/uom-categories/[uomCategoryId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { uomCategoryId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getUomCategoryClient()
        const response = await client.updateUOMCategory({ ...body, uomCategoryId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating UOM Category:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update UOM category",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/uom-categories/[uomCategoryId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { uomCategoryId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUomCategoryClient()
        const response = await client.deleteUOMCategory({ uomCategoryId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting UOM Category:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete UOM category",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
