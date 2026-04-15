// IAM Employee Level routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getEmployeeLevelClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ employeeLevelId: string }> }

// GET /api/v1/iam/employee-levels/[employeeLevelId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { employeeLevelId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getEmployeeLevelClient()
        const response = await client.getEmployeeLevel({ employeeLevelId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching Employee Level:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch employee level",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/iam/employee-levels/[employeeLevelId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { employeeLevelId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getEmployeeLevelClient()
        const response = await client.updateEmployeeLevel({ employeeLevelId, ...body }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating Employee Level:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update employee level",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/iam/employee-levels/[employeeLevelId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { employeeLevelId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getEmployeeLevelClient()
        const response = await client.deleteEmployeeLevel({ employeeLevelId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting Employee Level:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete employee level",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
