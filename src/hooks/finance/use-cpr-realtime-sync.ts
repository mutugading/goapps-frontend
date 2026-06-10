"use client"
import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useNotificationEventStore } from "@/stores/notification-event-store"
import { fillAssignmentKeys } from "@/hooks/finance/use-fill-assignment"

// useCPRRealtimeSync subscribes to IAM notification events and invalidates
// TanStack Query caches when events relevant to the given CPR arrive.
// Wire this into request-detail-panel to keep the page in sync without polling.
export function useCPRRealtimeSync(requestId: number) {
  const qc = useQueryClient()
  const subscribe = useNotificationEventStore((s) => s.subscribe)

  useEffect(() => {
    if (!requestId) return
    const id = String(requestId)

    return subscribe((n) => {
      if (n.sourceType === "cost_product_request" && n.sourceId === id) {
        // CPR status changed or comment added — refresh detail + history + comments.
        void qc.invalidateQueries({ queryKey: ["finance", "cost-product-request", "detail", requestId] })
        void qc.invalidateQueries({ queryKey: ["finance", "cost-product-request", "list"] })
        void qc.invalidateQueries({ queryKey: ["finance", "cpr", "history", requestId] })
        void qc.invalidateQueries({ queryKey: ["finance", "cost-request-comment", "by-request", requestId] })
      }
      if (n.sourceType === "cost_fill_task" && n.sourceId === id) {
        // Fill task state changed — refresh fill tasks panel.
        void qc.invalidateQueries({ queryKey: fillAssignmentKeys.tasks(requestId) })
      }
    })
  }, [requestId, subscribe, qc])
}
