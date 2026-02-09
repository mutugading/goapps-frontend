"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

// Event type enum from proto
const EVENT_TYPES: Record<number, { label: string; color: string }> = {
    0: { label: "Unknown", color: "secondary" },
    1: { label: "Login", color: "default" },
    2: { label: "Logout", color: "secondary" },
    3: { label: "Login Failed", color: "destructive" },
    4: { label: "Password Reset", color: "outline" },
    5: { label: "Password Change", color: "outline" },
    6: { label: "2FA Enabled", color: "default" },
    7: { label: "2FA Disabled", color: "secondary" },
    8: { label: "Create", color: "default" },
    9: { label: "Update", color: "secondary" },
    10: { label: "Delete", color: "destructive" },
    11: { label: "Export", color: "outline" },
    12: { label: "Import", color: "outline" },
}

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
    performedAt: string
}

interface Pagination {
    currentPage: number
    pageSize: number
    totalItems: number
    totalPages: number
}

interface AuditLogTableProps {
    logs: AuditLog[]
    pagination: Pagination | null
    onPageChange: (page: number) => void
}

export function AuditLogTable({ logs, pagination, onPageChange }: AuditLogTableProps) {
    const getEventBadge = (eventType: number) => {
        const event = EVENT_TYPES[eventType] || EVENT_TYPES[0]
        return (
            <Badge variant={event.color as "default" | "secondary" | "destructive" | "outline"}>
                {event.label}
            </Badge>
        )
    }

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM d, yyyy HH:mm:ss")
        } catch {
            return dateString
        }
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No activity found
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.logId}>
                                <TableCell>
                                    <div className="space-y-1">
                                        {getEventBadge(log.eventType)}
                                        {log.tableName && (
                                            <p className="text-xs text-muted-foreground">
                                                {log.tableName}
                                            </p>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{log.fullName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            @{log.username}
                                        </p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                        {log.ipAddress}
                                    </code>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{log.serviceName}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(log.performedAt)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage <= 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage >= pagination.totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
