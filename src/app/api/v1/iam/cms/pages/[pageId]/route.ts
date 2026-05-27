// CMS Page routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getCmsPageClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ pageId: string }> }

// GET /api/v1/iam/cms/pages/[pageId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { pageId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCmsPageClient()
        const response = await client.getCMSPage({ pageId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching CMS Page:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch CMS page",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/cms/pages/[pageId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { pageId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getCmsPageClient()
        const response = await client.updateCMSPage({ pageId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating CMS Page:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update CMS page",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/iam/cms/pages/[pageId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { pageId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCmsPageClient()
        const response = await client.deleteCMSPage({ pageId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting CMS Page:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete CMS page",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
