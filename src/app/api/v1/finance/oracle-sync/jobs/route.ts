// Oracle Sync Jobs routes - List jobs and Trigger sync

import { NextRequest, NextResponse } from "next/server"
import { getOracleSyncClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

// GET /api/v1/finance/oracle-sync/jobs - List sync jobs
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const metadata = createMetadataFromRequest(request)
        const client = getOracleSyncClient()

        const response = await client.listSyncJobs(
            {
                page: Number(searchParams.get("page")) || 1,
                pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
                jobType: searchParams.get("jobType") || searchParams.get("job_type") || "",
                status: Number(searchParams.get("status")) || 0,
                period: searchParams.get("period") || "",
                search: searchParams.get("search") || "",
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
            pagination: response.pagination,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching sync jobs:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch sync jobs",
                    validationErrors: [],
                },
                data: [],
                pagination: { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
            },
            { status: 500 }
        )
    }
}

// POST /api/v1/finance/oracle-sync/jobs - Trigger a new sync
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const metadata = createMetadataFromRequest(request)
        const client = getOracleSyncClient()

        const response = await client.triggerSync(
            { period: body.period || "" },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error triggering sync:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to trigger sync",
                    validationErrors: [],
                },
            },
            { status: 500 }
        )
    }
}
