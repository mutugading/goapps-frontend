// GET /api/v1/iam/menus/tree - Get menu tree for sidebar

import { NextRequest, NextResponse } from "next/server"
import { getMenuClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const metadata = createMetadataFromRequest(request)
        const client = getMenuClient()
        const response = await client.getMenuTree({ serviceName: "" }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching menu tree:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch menu tree",
                    validationErrors: [],
                },
                data: [],
            },
            { status: 500 }
        )
    }
}
