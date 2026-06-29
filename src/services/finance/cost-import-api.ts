// Cost Import API service — template download, export, import, and job polling

import type {
  CostImportJob,
  SyncImportResult,
  AsyncImportResponse,
  ImportEntity,
  ImportKindKey,
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

// ── Bulk ETL import (v2 — presigned upload) ─────────────────────────────────

/**
 * Step 1 of the ETL import flow: ask the backend for a presigned PUT URL so the
 * browser can upload the file directly to object storage (bypassing the BFF and
 * gRPC message path entirely — no size inflation, no OOM).
 */
export async function getImportUploadURL(
  kind: ImportKindKey,
  fileName: string,
): Promise<{ uploadUrl: string; objectKey: string; expiresInSeconds: number }> {
  const res = await fetch(`${BASE}/import/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, fileName }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || json?.base?.isSuccess === false) {
    throw new Error(json?.base?.message || `Failed to get upload URL: ${res.status}`)
  }
  return {
    uploadUrl: json.uploadUrl ?? json.upload_url ?? "",
    objectKey: json.objectKey ?? json.object_key ?? "",
    expiresInSeconds: Number(json.expiresInSeconds ?? json.expires_in_seconds ?? 0),
  }
}

/**
 * Step 2 of the ETL import flow: PUT the file straight to the presigned MinIO URL
 * with upload progress. Uses XMLHttpRequest because fetch() cannot report upload
 * progress. Requires MinIO CORS to allow PUT from the app origin.
 */
export function putToPresignedUrl(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", uploadUrl, true)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`))
    }
    xhr.onerror = () =>
      reject(new Error("Upload failed — check network / storage CORS configuration"))
    xhr.send(file)
  })
}

/**
 * Step 3 of the ETL import flow: tell the backend to start the async ETL job for
 * the already-uploaded object. Returns the job ID to poll with getImportJob().
 */
export async function startCostingImport(
  kind: ImportKindKey,
  objectKey: string,
  fileName: string,
): Promise<{ jobId: number; status: string }> {
  const res = await fetch(`${BASE}/import/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, objectKey, fileName }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || json?.base?.isSuccess === false) {
    throw new Error(json?.base?.message || `Failed to start import: ${res.status}`)
  }
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
