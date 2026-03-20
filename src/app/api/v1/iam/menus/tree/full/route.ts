// GET /api/v1/iam/menus/tree/full - Get full menu tree for admin (not filtered by permissions)

import { NextRequest, NextResponse } from "next/server"
import { getMenuClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()

        const response = await client.getFullMenuTree(
            {
                serviceName:     searchParams.get("serviceName") ?? "",
                includeInactive: searchParams.get("includeInactive") === "true",
                includeHidden:   searchParams.get("includeHidden") === "true",
            },
            metadata
        )

        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching full menu tree:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch full menu tree", validationErrors: [] } },
            { status: 500 }
        )
    }
}
