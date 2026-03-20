// GET    /api/v1/iam/menus/[id]  - Get a menu by ID
// PUT    /api/v1/iam/menus/[id]  - Update a menu
// DELETE /api/v1/iam/menus/[id]  - Delete a menu

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

        const response = await client.getMenu({ menuId: id }, metadata)

        return NextResponse.json({
            base:                response.base,
            data:                response.data,
            requiredPermissions: response.requiredPermissions,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error getting menu:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to get menu", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.updateMenu(
            {
                menuId:    id,
                menuTitle: body.menuTitle,
                menuUrl:   body.menuUrl,
                iconName:  body.iconName,
                sortOrder: body.sortOrder,
                isVisible: body.isVisible,
                isActive:  body.isActive,
            },
            metadata
        )

        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating menu:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to update menu", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const { searchParams } = request.nextUrl
        const cascade = searchParams.get("cascade") === "true"
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.deleteMenu({ menuId: id, cascade }, metadata)

        return NextResponse.json({ base: response.base, deletedCount: response.deletedCount })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting menu:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to delete menu", validationErrors: [] } },
            { status: 500 }
        )
    }
}
