// GET  /api/v1/iam/menus/[id]/permissions  - Get permissions for a menu
// POST /api/v1/iam/menus/[id]/permissions  - Assign permissions to a menu

import { NextRequest, NextResponse } from "next/server"
import { getMenuClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.getMenuPermissions({ menuId: id }, metadata)

        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error getting menu permissions:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to get menu permissions", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.assignMenuPermissions(
            { menuId: id, permissionIds: body.permissionIds ?? [] },
            metadata
        )

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error assigning menu permissions:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to assign permissions", validationErrors: [] } },
            { status: 500 }
        )
    }
}
