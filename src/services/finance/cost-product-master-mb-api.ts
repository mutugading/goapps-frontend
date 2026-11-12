// CostProductMaster MB-link + Oracle ETL service (P7).
// Browser code calls only the /api/v1/finance/cost-product-masters/... BFF routes.

import {
  normalizeEtlApplyResult,
  normalizeEtlPreview,
  normalizeMbLink,
  type NormalizedEtlApplyResult,
  type NormalizedEtlPreview,
  type NormalizedMbLink,
} from "@/types/finance/cost-product-master"

interface BFFEnvelope<T> {
  base?: { isSuccess?: boolean; statusCode?: string; message?: string }
  data?: T
}

/**
 * Typed ETL failure. statusCode mirrors the BFF base status:
 *  - 503 Oracle ERP not configured/unreachable
 *  - 400 apply limit exceeded / run not in preview state / invalid from_date
 *  - 404 run not found (preview expired)
 */
export class EtlError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.name = "EtlError"
    this.statusCode = statusCode
  }
}

async function readEnvelope<T>(res: Response): Promise<BFFEnvelope<T>> {
  return (await res.json()) as BFFEnvelope<T>
}

function toEtlError(json: BFFEnvelope<unknown>, fallback: string): EtlError {
  const code = Number(json.base?.statusCode)
  return new EtlError(Number.isInteger(code) ? code : 500, json.base?.message || fallback)
}

export async function getMbLink(productSysId: number): Promise<NormalizedMbLink> {
  const res = await fetch(`/api/v1/finance/cost-product-masters/${productSysId}/mb-link`, {
    method: "GET",
    credentials: "include",
  })
  const json = await readEnvelope<unknown>(res)
  if (json.base?.isSuccess === false) {
    throw new Error(json.base.message || "Failed to load MB link")
  }
  return normalizeMbLink(json.data as Record<string, unknown> | undefined)
}

export async function relinkMb(productSysId: number): Promise<NormalizedMbLink> {
  const res = await fetch(`/api/v1/finance/cost-product-masters/${productSysId}/mb-relink`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  })
  const json = await readEnvelope<unknown>(res)
  if (json.base?.isSuccess === false) {
    throw new Error(json.base.message || "Failed to re-link MB")
  }
  return normalizeMbLink(json.data as Record<string, unknown> | undefined)
}

export interface PreviewProductEtlInput {
  /** YYYY-MM-DD */
  fromDate: string
  search?: string
  includeExisting?: boolean
}

export async function previewProductEtl(input: PreviewProductEtlInput): Promise<NormalizedEtlPreview> {
  const res = await fetch("/api/v1/finance/cost-product-masters/etl/preview", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fromDate: input.fromDate,
      search: input.search ?? "",
      includeExisting: input.includeExisting === true,
    }),
  })
  const json = await readEnvelope<unknown>(res)
  if (json.base?.isSuccess === false) throw toEtlError(json, "Failed to preview Oracle ETL")
  return normalizeEtlPreview(json.data as Record<string, unknown> | undefined)
}

export interface ApplyProductEtlInput {
  previewRunId: string
  rowKeys: string[]
}

export async function applyProductEtl(input: ApplyProductEtlInput): Promise<NormalizedEtlApplyResult> {
  const res = await fetch("/api/v1/finance/cost-product-masters/etl/apply", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ previewRunId: input.previewRunId, rowKeys: input.rowKeys }),
  })
  const json = await readEnvelope<unknown>(res)
  if (json.base?.isSuccess === false) throw toEtlError(json, "Failed to apply Oracle ETL")
  return normalizeEtlApplyResult(json.data as Record<string, unknown> | undefined)
}
