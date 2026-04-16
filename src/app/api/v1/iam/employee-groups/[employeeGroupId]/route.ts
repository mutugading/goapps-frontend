// IAM Employee Group routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getEmployeeGroupClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ employeeGroupId: string }> }

// GET /api/v1/iam/employee-groups/[employeeGroupId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { employeeGroupId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getEmployeeGroupClient()
        const response = await client.getEmployeeGroup({ employeeGroupId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching Employee Group:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch employee group",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/employee-groups/[employeeGroupId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { employeeGroupId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getEmployeeGroupClient()
        const response = await client.updateEmployeeGroup({ employeeGroupId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating Employee Group:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update employee group",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/iam/employee-groups/[employeeGroupId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { employeeGroupId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getEmployeeGroupClient()
        const response = await client.deleteEmployeeGroup({ employeeGroupId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting Employee Group:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete employee group",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
