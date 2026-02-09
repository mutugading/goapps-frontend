// GET /api/v1/iam/audit-logs - List audit logs with filters

import { NextRequest, NextResponse } from "next/server"
import { SERVICES, getBackendUrl, getForwardHeaders } from "@/lib/api/proxy"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const queryString = searchParams.toString()

        const backendUrl = getBackendUrl(SERVICES.IAM)
        const url = `${backendUrl}/api/v1/iam/audit-logs${queryString ? `?${queryString}` : ""}`

        const response = await fetch(url, {
            method: "GET",
            headers: getForwardHeaders(request),
        })

        const data = await response.json()

        // Convert snake_case to camelCase for frontend
        return NextResponse.json(
            {
                base: {
                    isSuccess: data.base?.is_success ?? false,
                    statusCode: data.base?.status_code || String(response.status),
                    message: data.base?.message || "",
                    validationErrors: data.base?.validation_errors || [],
                },
                data: (data.data || []).map((log: Record<string, unknown>) => ({
                    logId: log.log_id,
                    eventType: log.event_type,
                    tableName: log.table_name,
                    recordId: log.record_id,
                    userId: log.user_id,
                    username: log.username,
                    fullName: log.full_name,
                    ipAddress: log.ip_address,
                    userAgent: log.user_agent,
                    serviceName: log.service_name,
                    oldData: log.old_data,
                    newData: log.new_data,
                    changes: log.changes,
                    performedAt: log.performed_at,
                })),
                pagination: data.pagination
                    ? {
                        currentPage: data.pagination.current_page || 1,
                        pageSize: data.pagination.page_size || 10,
                        totalItems: data.pagination.total_items || 0,
                        totalPages: data.pagination.total_pages || 0,
                    }
                    : null,
            },
            { status: response.status }
        )
    } catch (error) {
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
