// Canonical Phase A — CostNotification (CN_).
export type NotificationTrigger =
  | "STATUS_CHANGE"
  | "MENTION"
  | "ASSIGNED"
  | "FEASIBILITY"
  | "COMMENT_ADDED"
  | "ROUTING_PROMOTED"
  | "REQUEST_REJECTED"
  | "REQUEST_CLOSED"

export interface CostNotification {
  notificationId: number
  recipientUserId: string
  triggerType: NotificationTrigger | string
  requestId?: number
  payload: string // JSON string
  isRead: boolean
  emailSentAt?: string
  createdAt: string
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0))
const numOpt = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "" || v === 0 || v === "0") return undefined
  return Number(v)
}

export function normalizeCostNotification(raw: Record<string, unknown>): CostNotification {
  return {
    notificationId: num(raw.notificationId ?? raw.notification_id),
    recipientUserId: str(raw.recipientUserId ?? raw.recipient_user_id),
    triggerType: str(raw.triggerType ?? raw.trigger_type),
    requestId: numOpt(raw.requestId ?? raw.request_id),
    payload: str(raw.payload),
    isRead: (raw.isRead ?? raw.is_read ?? false) as boolean,
    emailSentAt: str(raw.emailSentAt ?? raw.email_sent_at) || undefined,
    createdAt: str(raw.createdAt ?? raw.created_at),
  }
}
