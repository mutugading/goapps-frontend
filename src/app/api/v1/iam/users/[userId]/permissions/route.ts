// IAM User Permissions - Assign direct permissions to a user

import { NextRequest, NextResponse } from "next/server"
import { getUserClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ userId: string }> }

// POST /api/v1/iam/users/[userId]/permissions - Assign direct permissions
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { userId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getUserClient()
        const response = await client.assignUserPermissions({ userId, permissionIds: body.permissionIds }, metadata)

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error assigning permissions:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to assign permissions",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
