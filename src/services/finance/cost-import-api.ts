// Cost Import API service — template download, export, import, and job polling

import type {
  CostImportJob,
  SyncImportResult,
  AsyncImportResponse,
  ImportEntity,
} from "@/types/finance/cost-import"

const BASE = "/api/v1/finance/costing"

/**
 * Download a blank import template for the given entity.
 * Returns the raw Blob for the caller to trigger a browser download.
 */
export async function downloadTemplate(entity: ImportEntity): Promise<Blob> {
  const res = await fetch(`${BASE}/templates/${entity}`)
  if (!res.ok) throw new Error(`Template download failed: ${res.status}`)
  return res.blob()
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
  return res.blob()
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
