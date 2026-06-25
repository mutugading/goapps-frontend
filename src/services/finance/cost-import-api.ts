// Cost Import API service — template download, export, import, and job polling

import type {
  CostImportJob,
  SyncImportResult,
  AsyncImportResponse,
  ImportEntity,
  BulkValidationResult,
  BulkSheetValidationResult,
  BulkRowError,
} from "@/types/finance/cost-import"

const BASE = "/api/v1/finance/costing"
const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

function base64ToBlob(b64: string): Blob {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type: XLSX_MIME })
}

/**
 * Download a blank import template for the given entity.
 * Returns the raw Blob for the caller to trigger a browser download.
 */
export async function downloadTemplate(entity: ImportEntity): Promise<Blob> {
  const res = await fetch(`${BASE}/templates/${entity}`)
  if (!res.ok) throw new Error(`Template download failed: ${res.status}`)
  const json = await res.json()
  return base64ToBlob(json.fileContent as string)
}

/**
 * Export existing data for the given entity as an Excel file.
 * @param params Optional filter query params (e.g. active_filter, product_type_code, search).
 */
export async function exportData(
  entity: ImportEntity,
  params?: Record<string, string>,
): Promise<Blob> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : ""
  const res = await fetch(`${BASE}/export/${entity}${qs}`)
  if (!res.ok) throw new Error(`Export failed: ${res.status}`)
  const json = await res.json()
  return base64ToBlob(json.fileContent as string)
}

/**
 * Import data synchronously (product_type, parameter).
 * Sends file as base64-encoded content in JSON body (matches existing BFF import pattern).
 * Returns a SyncImportResult with success/skip/fail counts and row-level errors.
 */
export async function importSync(
  entity: ImportEntity,
  file: File,
  duplicateAction: "skip" | "update" | "error",
): Promise<SyncImportResult> {
  const fileContent = Array.from(new Uint8Array(await file.arrayBuffer()))
  const res = await fetch(`${BASE}/import/${entity}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileContent,
      fileName: file.name,
      duplicateAction,
    }),
  })
  if (!res.ok) throw new Error(`Import failed: ${res.status}`)
  const json = await res.json()
  return json.data as SyncImportResult
}

/**
 * Import data asynchronously (product_master, capp, cpp).
 * Returns a job ID that can be polled with getImportJob().
 */
export async function importAsync(
  entity: ImportEntity,
  file: File,
  duplicateAction: "skip" | "update" | "error",
): Promise<AsyncImportResponse> {
  const fileContent = Array.from(new Uint8Array(await file.arrayBuffer()))
  const res = await fetch(`${BASE}/import/${entity}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileContent,
      fileName: file.name,
      duplicateAction,
    }),
  })
  if (!res.ok) throw new Error(`Import failed: ${res.status}`)
  const json = await res.json()
  return { jobId: json.data?.job_id ?? json.data?.jobId ?? 0 }
}

/**
 * Poll the status of an async import job.
 */
export async function getImportJob(jobId: number): Promise<CostImportJob> {
  const res = await fetch(`${BASE}/import-jobs/${jobId}`)
  if (!res.ok) throw new Error(`Get job failed: ${res.status}`)
  const json = await res.json()
  return json.data as CostImportJob
}

export interface ListImportJobsParams {
  entity?: string
  status?: string
  page?: number
  pageSize?: number
}

export interface ListImportJobsResult {
  items: CostImportJob[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

/**
 * List import/export jobs with optional entity/status filters.
 */
export async function listImportJobs(
  params?: ListImportJobsParams,
): Promise<ListImportJobsResult> {
  const qs = new URLSearchParams()
  if (params?.entity) qs.set("entity", params.entity)
  if (params?.status) qs.set("status", params.status)
  if (params?.page) qs.set("page", String(params.page))
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize))
  const res = await fetch(`${BASE}/import-jobs?${qs.toString()}`)
  if (!res.ok) throw new Error(`List jobs failed: ${res.status}`)
  const json = await res.json()
  const raw: unknown[] = Array.isArray(json.data) ? json.data : []
  return {
    items: raw as CostImportJob[],
    totalItems: Number(json.pagination?.totalItems ?? raw.length),
    totalPages: Number(json.pagination?.totalPages ?? 1),
    currentPage: Number(json.pagination?.currentPage ?? 1),
    pageSize: Number(json.pagination?.pageSize ?? 20),
  }
}

// ── Bulk Product Routing ────────────────────────────────────────────────────

/**
 * Queue a bulk import of product master + routing data from an Excel file.
 * Returns a job ID that can be polled with getImportJob().
 */
export async function bulkImportProductMasterRouting(
  file: File,
  duplicateAction?: string,
): Promise<{ jobId: number; status: string }> {
  const fileContent = Array.from(new Uint8Array(await file.arrayBuffer()))
  const res = await fetch(`${BASE}/import/bulk_product_routing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileContent,
      fileName: file.name,
      duplicateAction: duplicateAction ?? "update",
    }),
  })
  if (!res.ok) throw new Error(`Bulk import failed: ${res.status}`)
  const json = await res.json()
  return {
    jobId: json.data?.jobId ?? json.data?.job_id ?? 0,
    status: json.data?.status ?? "",
  }
}

/**
 * Queue a params-only bulk import (product_parameters + product_applicable_params).
 * Products must already exist from a prior bulk_product_routing import.
 * Returns a job ID that can be polled with getImportJob().
 */
export async function bulkImportParamsOnly(
  file: File,
): Promise<{ jobId: number; status: string }> {
  const fileContent = Array.from(new Uint8Array(await file.arrayBuffer()))
  const res = await fetch(`${BASE}/import/bulk_params_only`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileContent, fileName: file.name }),
  })
  if (!res.ok) throw new Error(`Params-only import failed: ${res.status}`)
  const json = await res.json()
  return {
    jobId: json.data?.jobId ?? json.data?.job_id ?? 0,
    status: json.data?.status ?? "",
  }
}

/**
 * Download the params-only import template (2 sheets: product_parameters + applicable_params).
 */
export async function downloadParamsOnlyTemplate(): Promise<void> {
  const res = await fetch(`${BASE}/template/bulk_params_only`)
  if (!res.ok) throw new Error(`Template download failed: ${res.status}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "bulk_params_only_template.xlsx"
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Validate a bulk product routing Excel file without importing.
 * Returns a per-sheet summary with error/warning counts and sample errors.
 */
export async function validateBulkProductRoutingFile(
  file: File,
): Promise<BulkValidationResult> {
  const fileContent = Array.from(new Uint8Array(await file.arrayBuffer()))
  const res = await fetch(`${BASE}/validate/bulk_product_routing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileContent, fileName: file.name }),
  })
  if (!res.ok) throw new Error(`Validation failed: ${res.status}`)
  const json = await res.json()

  if (!json.base?.isSuccess && json.base?.isSuccess !== undefined) {
    throw new Error(json.base?.message || "Validation request failed")
  }

  // Normalise: handle both camelCase (gRPC-gateway) and snake_case (raw proto)
  const isValid: boolean = json.isValid ?? json.is_valid ?? false
  const rawSheets: unknown[] = Array.isArray(json.sheets) ? json.sheets : []

  const sheets: BulkSheetValidationResult[] = rawSheets.map((s) => {
    const sheet = s as Record<string, unknown>
    const rawErrors: unknown[] = Array.isArray(sheet.sampleErrors)
      ? (sheet.sampleErrors as unknown[])
      : Array.isArray(sheet.sample_errors)
        ? (sheet.sample_errors as unknown[])
        : []

    const sampleErrors: BulkRowError[] = rawErrors.map((e) => {
      const err = e as Record<string, unknown>
      return {
        rowNumber: Number(err.rowNumber ?? err.row_number ?? 0),
        field: String(err.field ?? ""),
        message: String(err.message ?? ""),
      }
    })

    return {
      sheetName: String(sheet.sheetName ?? sheet.sheet_name ?? ""),
      totalRows: Number(sheet.totalRows ?? sheet.total_rows ?? 0),
      errorCount: Number(sheet.errorCount ?? sheet.error_count ?? 0),
      warningCount: Number(sheet.warningCount ?? sheet.warning_count ?? 0),
      sampleErrors,
    }
  })

  return { isValid, sheets }
}

/**
 * Queue an async export of product master + routing data to MinIO.
 * When productSysIds is provided, exports only those products and their full
 * transitive dependency closure (intermediates reachable via PRODUCT-type RMs).
 * Returns a job ID that can be polled or viewed on the import-jobs page.
 */
export async function exportBulkProductRouting(options?: {
  productTypeCodes?: string[]
  productSysIds?: number[]
}): Promise<{ jobId: number; status: string }> {
  const res = await fetch(`${BASE}/export/bulk_product_routing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productTypeCodes: options?.productTypeCodes ?? [],
      productSysIds: options?.productSysIds ?? [],
    }),
  })
  if (!res.ok) throw new Error(`Bulk export failed: ${res.status}`)
  const json = await res.json()
  if (json.base?.isSuccess === false) {
    throw new Error(json.base?.message || "Bulk export failed")
  }
  return {
    jobId: json.jobId ?? json.job_id ?? json.data?.jobId ?? json.data?.job_id ?? 0,
    status: json.status ?? json.data?.status ?? "",
  }
}

/**
 * Download the blank bulk product routing import template.
 * Triggers a browser file download directly.
 */
export async function downloadBulkProductRoutingTemplate(): Promise<void> {
  const res = await fetch("/api/v1/finance/costing/template/bulk_product_routing")
  if (!res.ok) throw new Error("Failed to download template")
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "bulk_product_routing_template.xlsx"
  a.click()
  URL.revokeObjectURL(url)
}
