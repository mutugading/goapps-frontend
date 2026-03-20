// IAM Roles routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getRoleClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ roleId: string }> }

// GET /api/v1/iam/roles/[roleId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { roleId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getRoleClient()
        const response = await client.getRole({ roleId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching role:", error)
        return NextResponse.json(
            {
                base: { isSuccess: false, statusCode: "500", message: "Failed to fetch role", validationErrors: [] },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/roles/[roleId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { roleId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getRoleClient()
        const response = await client.updateRole({ roleId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating role:", error)
        return NextResponse.json(
            {
                base: { isSuccess: false, statusCode: "500", message: "Failed to update role", validationErrors: [] },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/iam/roles/[roleId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { roleId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getRoleClient()
        const response = await client.deleteRole({ roleId }, metadata)

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting role:", error)
        return NextResponse.json(
            {
                base: { isSuccess: false, statusCode: "500", message: "Failed to delete role", validationErrors: [] },
            },
            { status: 500 }
        )
    }
}
