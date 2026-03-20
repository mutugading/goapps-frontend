// IAM User Roles - Remove roles from user

import { NextRequest, NextResponse } from "next/server"
import { getUserClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ userId: string }> }

// POST /api/v1/iam/users/[userId]/roles/remove
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.removeUserRoles({ userId, roleIds: body.roleIds }, metadata)

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error removing roles:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to remove roles",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
