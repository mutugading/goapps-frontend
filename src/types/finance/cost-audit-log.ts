// Canonical Phase A — CostAuditLog (CAL_). Read-only.
export interface CostAuditLog {
  logId: number
  entityType: string
  entityId: number
  operation: string
  beforeData?: string // JSON string
  afterData?: string
  userId: string
  performedAt: string
}

export interface ListCostAuditLogsParams {
  entityType?: string
  entityId?: number
  userId?: string
  operation?: string
  fromDate?: string // YYYY-MM-DD
  toDate?: string
  page?: number
  pageSize?: number
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0))

export function normalizeCostAuditLog(raw: Record<string, unknown>): CostAuditLog {
  return {
    logId: num(raw.logId ?? raw.log_id),
    entityType: str(raw.entityType ?? raw.entity_type),
    entityId: num(raw.entityId ?? raw.entity_id),
    operation: str(raw.operation),
    beforeData: str(raw.beforeData ?? raw.before_data) || undefined,
    afterData: str(raw.afterData ?? raw.after_data) || undefined,
    userId: str(raw.userId ?? raw.user_id),
    performedAt: str(raw.performedAt ?? raw.performed_at),
  }
}
