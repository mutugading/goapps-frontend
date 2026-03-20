// GET /api/v1/iam/menus    - List menus (paginated flat list)
// POST /api/v1/iam/menus   - Create a new menu

import { NextRequest, NextResponse } from "next/server"
import { getMenuClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.listMenus(
            {
                page:         Number(searchParams.get("page") ?? "1"),
                pageSize:     Number(searchParams.get("pageSize") ?? "10"),
                search:       searchParams.get("search") ?? "",
                serviceName:  searchParams.get("serviceName") ?? "",
                sortBy:       searchParams.get("sortBy") ?? "",
                sortOrder:    searchParams.get("sortOrder") ?? "",
                activeFilter: Number(searchParams.get("activeFilter") ?? "0"),
                menuLevel:    Number(searchParams.get("menuLevel") ?? "0"),
            },
            metadata
        )

        return NextResponse.json({
            base:       response.base,
            data:       response.data,
            pagination: response.pagination,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error listing menus:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to list menus", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.createMenu(
            {
                parentId:      body.parentId ?? undefined,
                menuCode:      body.menuCode ?? "",
                menuTitle:     body.menuTitle ?? "",
                menuUrl:       body.menuUrl ?? undefined,
                iconName:      body.iconName ?? "",
                serviceName:   body.serviceName ?? "",
                menuLevel:     body.menuLevel ?? 1,
                sortOrder:     body.sortOrder ?? undefined,
                isVisible:     body.isVisible ?? true,
                permissionIds: body.permissionIds ?? [],
            },
            metadata
        )

        return NextResponse.json({ base: response.base, data: response.data }, { status: 201 })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error creating menu:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to create menu", validationErrors: [] } },
            { status: 500 }
        )
    }
}
