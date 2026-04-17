// Oracle Sync Periods route - List available sync periods

import { NextRequest, NextResponse } from "next/server"
import { getOracleSyncClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/finance/oracle-sync/periods - List distinct sync periods
export async function GET(request: NextRequest) {
    try {
        const metadata = createMetadataFromRequest(request)
        const client = getOracleSyncClient()

        const response = await client.listSyncPeriods({}, metadata)

        return NextResponse.json({
            base: response.base,
            periods: response.periods,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching sync periods:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch sync periods",
                    validationErrors: [],
                },
                periods: [],
            },
            { status: 500 }
        )
    }
}
