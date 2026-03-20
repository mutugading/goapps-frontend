// IAM Role Permissions - Get and Assign permissions to role

import { NextRequest, NextResponse } from "next/server"
import { getRoleClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ roleId: string }> }

// GET /api/v1/iam/roles/[roleId]/permissions
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { roleId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getRoleClient()
        const response = await client.getRolePermissions({ roleId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching role permissions:", error)
        return NextResponse.json(
            {
                base: { isSuccess: false, statusCode: "500", message: "Failed to fetch role permissions", validationErrors: [] },
            },
            { status: 500 }
        )
    }
}

// POST /api/v1/iam/roles/[roleId]/permissions - Assign permissions
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { roleId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getRoleClient()
        const response = await client.assignRolePermissions({ roleId, permissionIds: body.permissionIds }, metadata)

        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error assigning permissions:", error)
        return NextResponse.json(
            {
                base: { isSuccess: false, statusCode: "500", message: "Failed to assign permissions", validationErrors: [] },
            },
            { status: 500 }
        )
    }
}
