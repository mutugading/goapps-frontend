"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Monitor, Globe, LogIn, LogOut, Key, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

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

// Event type mapping
const EVENT_TYPES: Record<number, { label: string; icon: React.ElementType; color: string }> = {
    1: { label: "Login", icon: LogIn, color: "text-green-600" },
    2: { label: "Logout", icon: LogOut, color: "text-gray-600" },
    3: { label: "Failed Login", icon: LogIn, color: "text-red-600" },
    4: { label: "Password Changed", icon: Key, color: "text-blue-600" },
    5: { label: "2FA Enabled", icon: Shield, color: "text-green-600" },
    6: { label: "2FA Disabled", icon: Shield, color: "text-amber-600" },
}

interface ActivityLogInlineProps {
    /** Maximum number of items to show */
    limit?: number
}

export function ActivityLogInline({ limit = 10 }: ActivityLogInlineProps) {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true)
                setError(null)

                const params = new URLSearchParams()
                params.set("page", "1")
                params.set("page_size", String(limit))

                const response = await fetch(`/api/v1/iam/audit-logs?${params.toString()}`)
                const data = await response.json()

                if (data.base?.isSuccess) {
                    setLogs(data.data || [])
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

        fetchLogs()
    }, [limit])

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No activity recorded yet</p>
            </div>
        )
    }

    const parseUserAgent = (ua: string): string => {
        if (!ua) return "Unknown device"
        if (ua.includes("Chrome")) return "Chrome"
        if (ua.includes("Firefox")) return "Firefox"
        if (ua.includes("Safari")) return "Safari"
        if (ua.includes("Edge")) return "Edge"
        return "Browser"
    }

    return (
        <div className="space-y-4">
            {logs.map((log) => {
                const eventInfo = EVENT_TYPES[log.eventType] || {
                    label: "Activity",
                    icon: Monitor,
                    color: "text-muted-foreground",
                }
                const Icon = eventInfo.icon

                return (
                    <div
                        key={log.logId}
                        className="flex items-start gap-3 pb-4 border-b last:border-0"
                    >
                        <div className={`p-2 rounded-full bg-muted ${eventInfo.color}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{eventInfo.label}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                <span>{log.ipAddress}</span>
                                <span>{parseUserAgent(log.userAgent)}</span>
                                <span>
                                    {formatDistanceToNow(new Date(log.performedAt), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
