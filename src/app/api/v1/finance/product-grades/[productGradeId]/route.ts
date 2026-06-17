// Finance ProductGrade routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getProductGradeClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ productGradeId: string }> }

// GET /api/v1/finance/product-grades/[productGradeId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { productGradeId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getProductGradeClient()
        const response = await client.getProductGrade({ pgId: productGradeId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching Product Grade:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch product grade",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/product-grades/[productGradeId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { productGradeId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getProductGradeClient()
        const response = await client.updateProductGrade({ ...body, pgId: productGradeId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating Product Grade:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update product grade",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/product-grades/[productGradeId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { productGradeId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getProductGradeClient()
        const response = await client.deleteProductGrade({ pgId: productGradeId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting Product Grade:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete product grade",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
