// Finance Box Bobbin Cost Rate routes — DELETE by rate ID

import { NextRequest, NextResponse } from "next/server"
import { getBoxBobbinCostClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

type RouteContext = { params: Promise<{ boxBobbinCostId: string; rateId: string }> }

// DELETE /api/v1/finance/box-bobbin-costs/[boxBobbinCostId]/rates/[rateId]
export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { boxBobbinCostId, rateId } = await context.params
        const metadata = createMetadataFromRequest(request)
        const client = getBoxBobbinCostClient()

        const response = await client.deleteBoxBobbinCostRate(
            { bbcId: boxBobbinCostId, bbcrId: rateId },
            metadata
        )

        return NextResponse.json({
            base: response.base,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error deleting Box Bobbin Cost Rate:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to delete box bobbin cost rate",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
