"use client"

// Audit log tab — BI dashboard config changes are recorded in the platform-wide
// activity log. For MVP this links to the central audit view; a BI-scoped filter
// can be added when the activity-log API exposes entity_type filtering.

import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function AuditLog() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Dashboard configuration changes are tracked in the platform activity log.
        </p>
        <Button asChild variant="outline">
          <Link href="/settings/activity">Open Activity Log</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
