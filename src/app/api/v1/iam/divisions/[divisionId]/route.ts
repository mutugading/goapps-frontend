// IAM Divisions - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getDivisionClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ divisionId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { divisionId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getDivisionClient()
        const response = await client.getDivision({ divisionId }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching division:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch division", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { divisionId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getDivisionClient()
        const response = await client.updateDivision({ divisionId, ...body }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating division:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to update division", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { divisionId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getDivisionClient()
        const response = await client.deleteDivision({ divisionId }, metadata)
        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting division:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to delete division", validationErrors: [] } },
            { status: 500 }
        )
    }
}
