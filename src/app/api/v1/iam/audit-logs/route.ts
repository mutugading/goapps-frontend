// GET /api/v1/iam/audit-logs - List audit logs with filters

import { NextRequest, NextResponse } from "next/server"
import { getAuditClient, createMetadataFromRequest, isGrpcError, handleGrpcError } from "@/lib/grpc"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        const metadata = createMetadataFromRequest(request)
        const client = getAuditClient()
        const response = await client.listAuditLogs(
            {
                page: Number(searchParams.get("page")) || 1,
                pageSize: Number(searchParams.get("pageSize") || searchParams.get("page_size")) || 10,
                search: searchParams.get("search") || "",
                eventType: Number(searchParams.get("eventType") || searchParams.get("event_type")) || 0,
                userId: searchParams.get("userId") || searchParams.get("user_id") || undefined,
                tableName: searchParams.get("tableName") || searchParams.get("table_name") || "",
                serviceName: searchParams.get("serviceName") || searchParams.get("service_name") || "",
                dateFrom: searchParams.get("dateFrom") || searchParams.get("date_from") || searchParams.get("startDate") || "",
                dateTo: searchParams.get("dateTo") || searchParams.get("date_to") || searchParams.get("endDate") || "",
                sortBy: searchParams.get("sortBy") || searchParams.get("sort_by") || "",
                sortOrder: searchParams.get("sortOrder") || searchParams.get("sort_order") || "",
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
        console.error("Error fetching audit logs:", error)
        return NextResponse.json(
            {
                base: {
                    isSuccess: false,
                    statusCode: "500",
                    message: "Failed to fetch audit logs",
                    validationErrors: [],
                },
                data: [],
                pagination: null,
            },
            { status: 500 }
        )
    }
}
