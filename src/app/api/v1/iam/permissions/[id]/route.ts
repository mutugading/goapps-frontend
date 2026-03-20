// IAM Permission routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getPermissionClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/iam/permissions/[id] - Get permission by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const metadata = createMetadataFromRequest(request)
        const client = getPermissionClient()

        const response = await client.getPermission({ permissionId: id }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching permission:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch permission", validationErrors: [] } },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/permissions/[id] - Update permission
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getPermissionClient()

        const response = await client.updatePermission(
            { permissionId: id, ...body },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating permission:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to update permission", validationErrors: [] } },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/iam/permissions/[id] - Delete permission
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const metadata = createMetadataFromRequest(request)
        const client = getPermissionClient()

        const response = await client.deletePermission({ permissionId: id }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting permission:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to delete permission", validationErrors: [] } },
            { status: 500 }
        )
    }
}
