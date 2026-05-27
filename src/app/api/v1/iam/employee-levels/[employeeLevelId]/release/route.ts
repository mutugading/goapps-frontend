// POST /api/v1/iam/employee-levels/[employeeLevelId]/release

import { NextRequest, NextResponse } from "next/server"
import { getEmployeeLevelClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ employeeLevelId: string }> }

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { employeeLevelId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getEmployeeLevelClient()

        const response = await client.releaseEmployeeLevel(
            { employeeLevelId, notes: body.notes || "" },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error releasing employee level:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to release employee level",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
