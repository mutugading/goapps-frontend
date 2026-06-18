// Finance Machine routes - Get, Update, Delete by ID

import { NextRequest, NextResponse } from "next/server"
import { getMachineClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ machineId: string }> }

// GET /api/v1/finance/machines/[machineId]
export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { machineId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getMachineClient()
        const response = await client.getMachine({ machineId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching Machine:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch machine",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// PUT /api/v1/finance/machines/[machineId]
export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { machineId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getMachineClient()
        const response = await client.updateMachine({ ...body, machineId }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error updating Machine:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to update machine",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// DELETE /api/v1/finance/machines/[machineId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { machineId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getMachineClient()
        const response = await client.deleteMachine({ machineId }, metadata)

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting Machine:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete machine",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
