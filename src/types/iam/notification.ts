// Notification types — wrappers around the generated proto types with
// camelCase/snake_case-tolerant normalizers and typed action_payload helpers.

import {
  NotificationType as PNotificationType,
  NotificationSeverity as PNotificationSeverity,
  NotificationActionType as PNotificationActionType,
  NotificationStatus as PNotificationStatus,
} from "@/types/generated/iam/v1/notification"

// Re-export the proto enums so call-sites use a single source.
export {
  NotificationType,
  NotificationSeverity,
  NotificationActionType,
  NotificationStatus,
} from "@/types/generated/iam/v1/notification"

// =============================================================================
// Raw + Normalized
// =============================================================================

export interface RawNotification {
  notificationId?: string
  notification_id?: string
  recipientUserId?: string
  recipient_user_id?: string
  type?: PNotificationType | number | string
  severity?: PNotificationSeverity | number | string
  title?: string
  body?: string
  actionType?: PNotificationActionType | number | string
  action_type?: PNotificationActionType | number | string
  actionPayload?: string
  action_payload?: string
  status?: PNotificationStatus | number | string
  readAt?: string
  read_at?: string
  archivedAt?: string
  archived_at?: string
  expiresAt?: string
  expires_at?: string
  sourceType?: string
  source_type?: string
  sourceId?: string
  source_id?: string
  createdAt?: string
  created_at?: string
  createdBy?: string
  created_by?: string
}

export interface Notification {
  notificationId: string
  recipientUserId: string
  type: PNotificationType
  severity: PNotificationSeverity
  title: string
  body: string
  actionType: PNotificationActionType
  actionPayload: string
  status: PNotificationStatus
  readAt: string
  archivedAt: string
  expiresAt: string
  sourceType: string
  sourceId: string
  createdAt: string
  createdBy: string
}

function toEnum<T extends number>(value: unknown, fallback: T): T {
  if (typeof value === "number") return value as T
  if (typeof value === "string" && value !== "") {
    const n = Number(value)
    if (!Number.isNaN(n)) return n as T
  }
  return fallback
}

export function normalizeNotification(raw: RawNotification): Notification {
  return {
    notificationId: raw.notificationId ?? raw.notification_id ?? "",
    recipientUserId: raw.recipientUserId ?? raw.recipient_user_id ?? "",
    type: toEnum<PNotificationType>(raw.type, PNotificationType.NOTIFICATION_TYPE_UNSPECIFIED),
    severity: toEnum<PNotificationSeverity>(raw.severity, PNotificationSeverity.NOTIFICATION_SEVERITY_INFO),
    title: raw.title ?? "",
    body: raw.body ?? "",
    actionType: toEnum<PNotificationActionType>(
      raw.actionType ?? raw.action_type,
      PNotificationActionType.NOTIFICATION_ACTION_TYPE_NONE,
    ),
    actionPayload: raw.actionPayload ?? raw.action_payload ?? "",
    status: toEnum<PNotificationStatus>(raw.status, PNotificationStatus.NOTIFICATION_STATUS_UNREAD),
    readAt: raw.readAt ?? raw.read_at ?? "",
    archivedAt: raw.archivedAt ?? raw.archived_at ?? "",
    expiresAt: raw.expiresAt ?? raw.expires_at ?? "",
    sourceType: raw.sourceType ?? raw.source_type ?? "",
    sourceId: raw.sourceId ?? raw.source_id ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    createdBy: raw.createdBy ?? raw.created_by ?? "",
  }
}

// =============================================================================
// Action payload helpers (typed access)
// =============================================================================

export interface DownloadPayload {
  file_path?: string
  file_name?: string
  size_bytes?: number
  expires_at?: string
}

export interface NavigatePayload {
  path?: string
}

export interface ExternalLinkPayload {
  url?: string
  label?: string
}

export interface ApproveRejectPayload {
  resource_type?: string
  resource_id?: string
  approve_endpoint?: string
  reject_endpoint?: string
}

export interface MultiActionPayload {
  actions?: Array<{
    key: string
    label: string
    style?: "primary" | "destructive" | "secondary"
    endpoint?: string
  }>
}

export interface ReplyPayload {
  thread_id?: string
  preview?: string
  open_path?: string
}

export interface SnoozePayload {
  options_minutes?: number[]
  original_due_at?: string
}

export function parseActionPayload<T = unknown>(notif: Notification): T | null {
  if (!notif.actionPayload) return null
  try {
    return JSON.parse(notif.actionPayload) as T
  } catch {
    return null
  }
}

// =============================================================================
// Display helpers
// =============================================================================

export function severityLabel(s: PNotificationSeverity): string {
  switch (s) {
    case PNotificationSeverity.NOTIFICATION_SEVERITY_INFO:
      return "Info"
    case PNotificationSeverity.NOTIFICATION_SEVERITY_SUCCESS:
      return "Success"
    case PNotificationSeverity.NOTIFICATION_SEVERITY_WARNING:
      return "Warning"
    case PNotificationSeverity.NOTIFICATION_SEVERITY_ERROR:
      return "Error"
    default:
      return ""
  }
}

export function severityClass(s: PNotificationSeverity): string {
  switch (s) {
    case PNotificationSeverity.NOTIFICATION_SEVERITY_SUCCESS:
      return "text-emerald-600 dark:text-emerald-400"
    case PNotificationSeverity.NOTIFICATION_SEVERITY_WARNING:
      return "text-amber-600 dark:text-amber-400"
    case PNotificationSeverity.NOTIFICATION_SEVERITY_ERROR:
      return "text-red-600 dark:text-red-400"
    case PNotificationSeverity.NOTIFICATION_SEVERITY_INFO:
    default:
      return "text-slate-600 dark:text-slate-400"
  }
}

export function typeLabel(t: PNotificationType): string {
  switch (t) {
    case PNotificationType.NOTIFICATION_TYPE_EXPORT_READY:
      return "Export"
    case PNotificationType.NOTIFICATION_TYPE_ALERT:
      return "Alert"
    case PNotificationType.NOTIFICATION_TYPE_APPROVAL:
      return "Approval"
    case PNotificationType.NOTIFICATION_TYPE_CHAT:
      return "Chat"
    case PNotificationType.NOTIFICATION_TYPE_REMINDER:
      return "Reminder"
    case PNotificationType.NOTIFICATION_TYPE_SYSTEM:
      return "System"
    case PNotificationType.NOTIFICATION_TYPE_MENTION:
      return "Mention"
    case PNotificationType.NOTIFICATION_TYPE_ASSIGNMENT:
      return "Assignment"
    case PNotificationType.NOTIFICATION_TYPE_ANNOUNCEMENT:
      return "Announcement"
    default:
      return "Notification"
  }
}
