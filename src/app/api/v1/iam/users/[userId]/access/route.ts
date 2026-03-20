// IAM User Access - Get roles and permissions

import { NextRequest, NextResponse } from "next/server"
import { getUserClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ userId: string }> }

// GET /api/v1/iam/users/[userId]/access
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.getUserRolesAndPermissions({ userId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching user access:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch user access info",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
