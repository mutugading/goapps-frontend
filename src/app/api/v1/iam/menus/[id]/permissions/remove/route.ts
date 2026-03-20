// POST /api/v1/iam/menus/[id]/permissions/remove - Remove permissions from a menu

import { NextRequest, NextResponse } from "next/server"
import { getMenuClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.removeMenuPermissions(
            { menuId: id, permissionIds: body.permissionIds ?? [] },
            metadata
        )

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error removing menu permissions:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to remove permissions", validationErrors: [] } },
            { status: 500 }
        )
    }
}
