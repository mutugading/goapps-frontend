// GET /api/v1/iam/audit-logs/summary - Get audit log summary for dashboard

import { NextRequest, NextResponse } from "next/server"
import { SERVICES, getBackendUrl, getForwardHeaders } from "@/lib/api/proxy"

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const queryString = searchParams.toString()

        const backendUrl = getBackendUrl(SERVICES.IAM)
        const url = `${backendUrl}/api/v1/iam/audit-logs/summary${queryString ? `?${queryString}` : ""}`

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
                data: data.data
                    ? {
                        totalEvents: data.data.total_events || 0,
                        loginCount: data.data.login_count || 0,
                        loginFailedCount: data.data.login_failed_count || 0,
                        logoutCount: data.data.logout_count || 0,
                        createCount: data.data.create_count || 0,
                        updateCount: data.data.update_count || 0,
                        deleteCount: data.data.delete_count || 0,
                        exportCount: data.data.export_count || 0,
                        importCount: data.data.import_count || 0,
                        topUsers: (data.data.top_users || []).map((u: Record<string, unknown>) => ({
                            userId: u.user_id,
                            username: u.username,
                            fullName: u.full_name,
                            eventCount: u.event_count,
                        })),
                        eventsByHour: (data.data.events_by_hour || []).map((h: Record<string, unknown>) => ({
                            hour: h.hour,
                            count: h.count,
                        })),
                    }
                    : null,
            },
            { status: response.status }
        )
    } catch (error) {
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
