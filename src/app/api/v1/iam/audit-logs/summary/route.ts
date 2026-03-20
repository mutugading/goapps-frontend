// GET /api/v1/iam/audit-logs/summary - Get audit log summary for dashboard

import { NextRequest, NextResponse } from "next/server"
import { getAuditClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const metadata = createMetadataFromRequest(request)
        const client = getAuditClient()
        const response = await client.getAuditSummary(
            {
                timeRange: searchParams.get("timeRange") || searchParams.get("time_range") || "today",
                serviceName: searchParams.get("serviceName") || searchParams.get("service_name") || "",
            },
            metadata
        )

        return NextResponse.json({
            base: response.base,
            data: response.data ?? null,
        })
    } catch (error) {
        if (isGrpcError(error)) return handleGrpcError(error)
        console.error("Error fetching audit summary:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch audit summary",
                    validationErrors: [],
                },
                data: null,
            },
            { status: 500 }
        )
    }
}
