// IAM Sections - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getSectionClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ sectionId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { sectionId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getSectionClient()
        const response = await client.getSection({ sectionId }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching section:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch section", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { sectionId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getSectionClient()
        const response = await client.updateSection({ sectionId, ...body }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating section:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to update section", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { sectionId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getSectionClient()
        const response = await client.deleteSection({ sectionId }, metadata)
        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting section:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to delete section", validationErrors: [] } },
            { status: 500 }
        )
    }
}
