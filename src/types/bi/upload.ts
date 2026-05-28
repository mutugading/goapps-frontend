// BI Excel upload — normalized types + normalizer (handles camelCase & snake_case).
//
// The backend BiUploadService returns BiUpload entities; the BFF re-serializes them
// to JSON. This module gives the client a stable, fully-resolved shape and never
// exposes raw protobuf field-name ambiguity to components.

import type { BiUpload, UploadRowError } from "@/types/generated/finance/v1/bi"

/** Canonical upload lifecycle states (mirrors backend status string). */
export type UploadStatus = "PENDING" | "PREVIEW" | "COMMITTED" | "CANCELLED" | "FAILED"

/** A single per-row validation error, resolved to display-friendly fields. */
export interface NormalizedUploadError {
  row: number
  column: string
  value: string
  issue: string
  expected: string
}

/** A normalized upload preview / record. uploadId stays internal (never shown raw). */
export interface NormalizedUpload {
  uploadId: string
  targetType: string
  fileName: string
  fileSize: number
  status: UploadStatus
  totalRows: number
  validRows: number
  invalidRows: number
  committedRows: number
  errors: NormalizedUploadError[]
  uploadedBy: string
  uploadedAt: string | null
}

/** Raw shape as it may arrive over the wire (camel or snake case). */
interface RawUploadError {
  row?: number
  column?: string
  value?: string
  issue?: string
  expected?: string
}

interface RawUpload {
  uploadId?: string
  upload_id?: string
  targetType?: string
  target_type?: string
  fileName?: string
  file_name?: string
  fileSize?: number | string
  file_size?: number | string
  status?: string
  totalRows?: number | string
  total_rows?: number | string
  validRows?: number | string
  valid_rows?: number | string
  invalidRows?: number | string
  invalid_rows?: number | string
  committedRows?: number | string
  committed_rows?: number | string
  errors?: RawUploadError[]
  uploadedBy?: string
  uploaded_by?: string
  uploadedAt?: string | Date
  uploaded_at?: string | Date
}

function toNumber(value: number | string | undefined): number {
  if (typeof value === "number") return value
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

function toIsoString(value: string | Date | undefined): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function toStatus(status: string | undefined): UploadStatus {
  const upper = (status ?? "").toUpperCase()
  switch (upper) {
    case "PENDING":
    case "PREVIEW":
    case "COMMITTED":
    case "CANCELLED":
    case "FAILED":
      return upper
    default:
      return "PENDING"
  }
}

function normalizeError(raw: RawUploadError): NormalizedUploadError {
  return {
    row: toNumber(raw.row),
    column: raw.column ?? "",
    value: raw.value ?? "",
    issue: raw.issue ?? "",
    expected: raw.expected ?? "",
  }
}

/** Normalize a raw upload object (camel/snake) to NormalizedUpload. */
export function normalizeUpload(raw: RawUpload | BiUpload | null | undefined): NormalizedUpload {
  const r = (raw ?? {}) as RawUpload
  return {
    uploadId: r.uploadId ?? r.upload_id ?? "",
    targetType: r.targetType ?? r.target_type ?? "",
    fileName: r.fileName ?? r.file_name ?? "",
    fileSize: toNumber(r.fileSize ?? r.file_size),
    status: toStatus(r.status),
    totalRows: toNumber(r.totalRows ?? r.total_rows),
    validRows: toNumber(r.validRows ?? r.valid_rows),
    invalidRows: toNumber(r.invalidRows ?? r.invalid_rows),
    committedRows: toNumber(r.committedRows ?? r.committed_rows),
    errors: Array.isArray(r.errors) ? r.errors.map(normalizeError) : [],
    uploadedBy: r.uploadedBy ?? r.uploaded_by ?? "",
    uploadedAt: toIsoString(r.uploadedAt ?? r.uploaded_at),
  }
}

export type { UploadRowError }
