// BI config-change audit types + normalizer.
//
// The backend records every dashboard / dashboard-group CREATE/UPDATE/DELETE.
// The BFF returns proto-shaped JSON which may use camelCase or snake_case keys
// depending on serialization, so normalize defensively.

/** Raw audit entry as returned by the BFF (camel/snake tolerant). */
export interface RawAuditEntry {
  auditId?: number | string
  audit_id?: number | string
  entityType?: string
  entity_type?: string
  entityCode?: string
  entity_code?: string
  entityTitle?: string
  entity_title?: string
  action?: string
  changedBy?: string
  changed_by?: string
  changedAt?: string | Date
  changed_at?: string | Date
  summary?: string
}

/** Audit entity type discriminator. */
export type AuditEntityType = "dashboard" | "group"

/** Audit action discriminator. */
export type AuditAction = "CREATE" | "UPDATE" | "DELETE"

/** Normalized audit entry consumed by the UI. */
export interface NormalizedAuditEntry {
  auditId: number
  entityType: string
  entityCode: string
  entityTitle: string
  action: string
  changedBy: string
  /** ISO string or empty when unknown. */
  changedAt: string
  summary: string
}

function coerceDate(value: string | Date | undefined): string {
  if (!value) return ""
  if (value instanceof Date) return value.toISOString()
  return value
}

/** Normalize a single raw audit entry. */
export function normalizeAuditEntry(raw: RawAuditEntry): NormalizedAuditEntry {
  return {
    auditId: Number(raw.auditId ?? raw.audit_id ?? 0),
    entityType: raw.entityType ?? raw.entity_type ?? "",
    entityCode: raw.entityCode ?? raw.entity_code ?? "",
    entityTitle: raw.entityTitle ?? raw.entity_title ?? "",
    action: raw.action ?? "",
    changedBy: raw.changedBy ?? raw.changed_by ?? "",
    changedAt: coerceDate(raw.changedAt ?? raw.changed_at),
    summary: raw.summary ?? "",
  }
}
