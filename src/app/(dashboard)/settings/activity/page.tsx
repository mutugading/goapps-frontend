"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"
import { AuditLogTable } from "@/components/audit/audit-log-table"
import { AuditFilters, type AuditFilterValues } from "@/components/audit/audit-filters"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

interface AuditLog {
    logId: string
    eventType: number
    tableName: string | null
    recordId: string | null
    userId: string
    username: string
    fullName: string
    ipAddress: string
    userAgent: string
    serviceName: string
    oldData: string | null
    newData: string | null
    changes: string | null
    performedAt: string
}

interface Pagination {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
}

export default function ActivityPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<AuditFilterValues>({
        page: 1,
        pageSize: 10,
        eventType: "",
        dateFrom: "",
        dateTo: "",
    })
    const router = useRouter()

    const fetchLogs = async (newFilters: AuditFilterValues) => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams()
            params.set("page", String(newFilters.page))
            params.set("page_size", String(newFilters.pageSize))
            if (newFilters.eventType) params.set("event_type", newFilters.eventType)
            if (newFilters.dateFrom) params.set("date_from", newFilters.dateFrom)
            if (newFilters.dateTo) params.set("date_to", newFilters.dateTo)

            const response = await fetch(`/api/v1/iam/audit-logs?${params.toString()}`)
            const data = await response.json()

            if (data.base?.isSuccess) {
                setLogs(data.data || [])
                setPagination(data.pagination)
            } else {
                setError(data.base?.message || "Failed to load activity log")
            }
        } catch (err) {
            console.error("Error fetching activity log:", err)
            setError("Failed to load activity log")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs(filters)
    }, [filters])

    const handleFilterChange = (newFilters: AuditFilterValues) => {
        setFilters({ ...newFilters, page: 1 })
    }

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page })
    }

    return (
        <div>
            <PageHeader
                title="Activity Log"
                subtitle="View your recent account activity and login history"
            >
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Settings
                </Button>
            </PageHeader>

            <div className="space-y-6">
                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AuditFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Activity History</CardTitle>
                        <CardDescription>
                            {pagination
                                ? `Showing ${logs.length} of ${pagination.totalItems} entries`
                                : "Loading..."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        ) : loading ? (
                            <div className="space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <AuditLogTable
                                logs={logs}
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
