// Oracle Sync Job detail routes - Get job and Cancel job

import { NextRequest, NextResponse } from "next/server"
import { getOracleSyncClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/v1/finance/oracle-sync/jobs/[id] - Get sync job detail
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const metadata = createMetadataFromRequest(request)
        const client = getOracleSyncClient()

        const response = await client.getSyncJob({ jobId: id }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching sync job:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch sync job",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}

// POST /api/v1/finance/oracle-sync/jobs/[id] - Cancel sync job
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params
        const metadata = createMetadataFromRequest(request)
        const client = getOracleSyncClient()

        const response = await client.cancelSyncJob({ jobId: id }, metadata)

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error cancelling sync job:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to cancel sync job",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
