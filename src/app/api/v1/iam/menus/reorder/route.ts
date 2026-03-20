// POST /api/v1/iam/menus/reorder - Reorder menus within same parent

import { NextRequest, NextResponse } from "next/server"
import { getMenuClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.reorderMenus(
            {
                parentId: body.parentId ?? undefined,
                menuIds:  body.menuIds ?? [],
            },
            metadata
        )

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error reordering menus:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to reorder menus", validationErrors: [] } },
            { status: 500 }
        )
    }
}
