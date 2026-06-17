// Finance MBHead routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getMBHeadClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ mbhId: string }> }

// GET /api/v1/finance/mb-heads/[mbhId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { mbhId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getMBHeadClient()
        const response = await client.getMBHead({ mbhId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching MB Head:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch MB head",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/mb-heads/[mbhId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { mbhId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getMBHeadClient()
        const response = await client.updateMBHead({ ...body, mbhId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating MB Head:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update MB head",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/mb-heads/[mbhId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { mbhId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getMBHeadClient()
        const response = await client.deleteMBHead({ mbhId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting MB Head:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete MB head",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
