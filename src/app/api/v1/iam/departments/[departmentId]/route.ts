// IAM Departments - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getDepartmentClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ departmentId: string }> }

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { departmentId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getDepartmentClient()
        const response = await client.getDepartment({ departmentId }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching department:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to fetch department", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { departmentId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getDepartmentClient()
        const response = await client.updateDepartment({ departmentId, ...body }, metadata)
        return NextResponse.json({ base: response.base, data: response.data })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating department:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to update department", validationErrors: [] } },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { departmentId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getDepartmentClient()
        const response = await client.deleteDepartment({ departmentId }, metadata)
        return NextResponse.json({ base: response.base })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting department:", error)
        return NextResponse.json(
            { base: { isSuccess: false, statusCode: "500", message: "Failed to delete department", validationErrors: [] } },
            { status: 500 }
        )
    }
}
