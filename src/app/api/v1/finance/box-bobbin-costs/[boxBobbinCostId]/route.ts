// Finance Box Bobbin Cost routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getBoxBobbinCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ boxBobbinCostId: string }> }

// GET /api/v1/finance/box-bobbin-costs/[boxBobbinCostId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { boxBobbinCostId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getBoxBobbinCostClient()
        const response = await client.getBoxBobbinCost({ bbcId: boxBobbinCostId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching Box Bobbin Cost:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch box bobbin cost",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/box-bobbin-costs/[boxBobbinCostId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { boxBobbinCostId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getBoxBobbinCostClient()
        const response = await client.updateBoxBobbinCost({ ...body, bbcId: boxBobbinCostId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating Box Bobbin Cost:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update box bobbin cost",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/box-bobbin-costs/[boxBobbinCostId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { boxBobbinCostId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getBoxBobbinCostClient()
        const response = await client.deleteBoxBobbinCost({ bbcId: boxBobbinCostId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting Box Bobbin Cost:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete box bobbin cost",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
