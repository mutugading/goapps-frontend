// IAM Role Permissions - Remove permissions from role

import { NextRequest, NextResponse } from "next/server"
import { getRoleClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ roleId: string }> }

// POST /api/v1/iam/roles/[roleId]/permissions/remove
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { roleId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getRoleClient()
        const response = await client.removeRolePermissions({ roleId, permissionIds: body.permissionIds }, metadata)

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error removing permissions:", error)
        return NextResponse.json(
            {
                base: { isSuccess: false, statusCode: "500", message: "Failed to remove permissions", validationErrors: [] },
            },
            { status: 500 }
        )
    }
}
