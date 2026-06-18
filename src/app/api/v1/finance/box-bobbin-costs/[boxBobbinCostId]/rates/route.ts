// Finance Box Bobbin Cost Rate routes — POST (create rate), keyed under parent config

import { NextRequest, NextResponse } from "next/server"
import { getBoxBobbinCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ boxBobbinCostId: string }> }

// POST /api/v1/finance/box-bobbin-costs/[boxBobbinCostId]/rates
export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const { boxBobbinCostId } = await context.params
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getBoxBobbinCostClient()

        const response = await client.createBoxBobbinCostRate(
            { ...body, bbcId: boxBobbinCostId },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error creating Box Bobbin Cost Rate:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to create box bobbin cost rate",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
