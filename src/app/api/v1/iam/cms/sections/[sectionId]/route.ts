// CMS Section routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getCmsSectionClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ sectionId: string }> }

// GET /api/v1/iam/cms/sections/[sectionId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { sectionId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCmsSectionClient()
        const response = await client.getCMSSection({ sectionId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching CMS Section:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch CMS section",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/cms/sections/[sectionId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { sectionId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getCmsSectionClient()
        const response = await client.updateCMSSection({ sectionId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating CMS Section:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update CMS section",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/iam/cms/sections/[sectionId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { sectionId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getCmsSectionClient()
        const response = await client.deleteCMSSection({ sectionId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting CMS Section:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete CMS section",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
