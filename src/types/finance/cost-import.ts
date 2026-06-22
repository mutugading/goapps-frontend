// Cost Import Types — types for async/sync import jobs, entities, and results

export type ImportJobStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED" | "PARTIAL"

export type ImportEntity =
  | "product_type"
  | "parameter"
  | "product_master"
  | "capp"
  | "cpp"
  | "bulk_product_routing"
  | "bulk_product_routing_export"

export interface CostImportJob {
  jobId: number
  entity: ImportEntity
  status: ImportJobStatus
  totalRows: number
  processed: number
  success: number
  failed: number
  skipped: number
  errorFileUrl: string
  createdBy: string
  createdAt: string
  startedAt: string
  completedAt: string
}

export interface SyncImportResult {
  successCount: number
  skippedCount: number
  updatedCount: number
  failedCount: number
  errors: Array<{ rowNumber: number; field: string; message: string }>
}

export interface AsyncImportResponse {
  jobId: number
}

interface RawCostImportJob {
  job_id?: number
  jobId?: number
  entity?: string
  status?: string
  total_rows?: number
  totalRows?: number
  processed?: number
  success?: number
  failed?: number
  skipped?: number
  error_file_url?: string
  errorFileUrl?: string
  created_by?: string
  createdBy?: string
  created_at?: string
  createdAt?: string
  started_at?: string
  startedAt?: string
  completed_at?: string
  completedAt?: string
}

export function normalizeCostImportJob(raw: RawCostImportJob): CostImportJob {
  return {
    jobId: raw.jobId ?? raw.job_id ?? 0,
    entity: (raw.entity ?? "product_master") as ImportEntity,
    status: (raw.status ?? "PENDING") as ImportJobStatus,
    totalRows: raw.totalRows ?? raw.total_rows ?? 0,
    processed: raw.processed ?? 0,
    success: raw.success ?? 0,
    failed: raw.failed ?? 0,
    skipped: raw.skipped ?? 0,
    errorFileUrl: raw.errorFileUrl ?? raw.error_file_url ?? "",
    createdBy: raw.createdBy ?? raw.created_by ?? "",
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    startedAt: raw.startedAt ?? raw.started_at ?? "",
    completedAt: raw.completedAt ?? raw.completed_at ?? "",
  }
}

// ── Import entity label map ─────────────────────────────────────────────────

/** Human-readable labels for all import/export entity types. */
export const IMPORT_ENTITY_LABELS: Record<string, string> = {
  product_type: "Product Type",
  parameter: "Parameter",
  product_master: "Product Master",
  capp: "Cost Applicable Parameters",
  cpp: "Cost Product Parameters",
  bulk_product_routing: "Bulk Import (Product Master + Routing)",
  bulk_product_routing_export: "Bulk Export (Product Master + Routing)",
}

// ── Bulk Product Routing import/export ─────────────────────────────────────

/** Entity constant for the bulk import (product master + routing). */
export const ENTITY_BULK_PRODUCT_ROUTING = "bulk_product_routing"

/** Entity constant for the bulk export job (product master + routing). */
export const ENTITY_BULK_PRODUCT_ROUTING_EXPORT = "bulk_product_routing_export"

/** Row-level error from a single sheet during bulk validation. */
export interface BulkRowError {
  rowNumber: number
  field: string
  message: string
}

/** Per-sheet result from ValidateBulkProductRoutingFile. */
export interface BulkSheetValidationResult {
  sheetName: string
  totalRows: number
  errorCount: number
  warningCount: number
  sampleErrors: BulkRowError[]
}

/** Full result from ValidateBulkProductRoutingFile. */
export interface BulkValidationResult {
  isValid: boolean
  sheets: BulkSheetValidationResult[]
}
