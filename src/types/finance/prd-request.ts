// Product Request Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types (type-only)
// ============================================================================

export type {
  ProductRequest,
  CreateRequestRequest,
  CreateRequestResponse,
  GetRequestRequest,
  GetRequestResponse,
  ListRequestsRequest,
  ListRequestsResponse,
  UpdateRequestRequest,
  UpdateRequestResponse,
  DeleteRequestRequest,
  DeleteRequestResponse,
  AssignRequestRequest,
  AssignRequestResponse,
  ResolveRequestRequest,
  ResolveRequestResponse,
  RejectRequestRequest,
  RejectRequestResponse,
  SearchExistingProductsRequest,
  SearchExistingProductsResponse,
} from "@/types/generated/finance/v1/product_request"

// Message functions for parsing (XParser convention)
export {
  ProductRequest as ProductRequestParser,
  CreateRequestRequest as CreateRequestRequestParser,
  CreateRequestResponse as CreateRequestResponseParser,
  GetRequestRequest as GetRequestRequestParser,
  GetRequestResponse as GetRequestResponseParser,
  ListRequestsRequest as ListRequestsRequestParser,
  ListRequestsResponse as ListRequestsResponseParser,
  UpdateRequestRequest as UpdateRequestRequestParser,
  UpdateRequestResponse as UpdateRequestResponseParser,
  DeleteRequestRequest as DeleteRequestRequestParser,
  DeleteRequestResponse as DeleteRequestResponseParser,
  AssignRequestRequest as AssignRequestRequestParser,
  AssignRequestResponse as AssignRequestResponseParser,
  ResolveRequestRequest as ResolveRequestRequestParser,
  ResolveRequestResponse as ResolveRequestResponseParser,
  RejectRequestRequest as RejectRequestRequestParser,
  RejectRequestResponse as RejectRequestResponseParser,
  SearchExistingProductsRequest as SearchExistingProductsRequestParser,
  SearchExistingProductsResponse as SearchExistingProductsResponseParser,
} from "@/types/generated/finance/v1/product_request"

// ============================================================================
// UI Display Labels
// ============================================================================

export const REQUEST_STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_REVIEW: "In Review",
  PRODUCT_PROPOSED: "Product Proposed",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
}

export const REQUEST_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "PRODUCT_PROPOSED", label: "Product Proposed" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
] as const

export const REQUEST_STATUS_BADGE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  OPEN: "default",
  IN_REVIEW: "outline",
  PRODUCT_PROPOSED: "outline",
  RESOLVED: "default",
  REJECTED: "destructive",
}

// ============================================================================
// Simplified Params for Hooks
// ============================================================================

export interface ListRequestsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  requesterId?: string
  assignedTo?: string
  requesterDeptId?: string
  sortField?: string
  sortDesc?: boolean
}

export interface CreateRequestParams {
  title: string
  description?: string
  targetSpecsJson?: string
  dueDate?: string
}

export interface UpdateRequestParams {
  requestId: string
  title: string
  description?: string
  targetSpecsJson?: string
  dueDate?: string
}

export interface AssignRequestParams {
  requestId: string
  assigneeId: string
}

export interface ResolveRequestParams {
  requestId: string
  productId: string
  resolutionNote?: string
}

export interface RejectRequestParams {
  requestId: string
  reason: string
}

export interface SearchExistingProductsParams {
  query: string
  shadeCode?: string
  limit?: number
}

// ============================================================================
// Normalizer (handles both camelCase + snake_case from BFF responses)
// Note: RawAuditInfo and normalizeAuditInfo are kept private to avoid barrel
// export conflicts. NormalizedAuditInfo is imported from product.ts (shared).
// ============================================================================

interface RawAuditInfo {
  createdAt?: string
  created_at?: string
  createdBy?: string
  created_by?: string
  updatedAt?: string
  updated_at?: string
  updatedBy?: string
  updated_by?: string
  deletedAt?: string
  deleted_at?: string
  deletedBy?: string
  deleted_by?: string
}

export interface RawProductRequest {
  requestId?: string
  request_id?: string
  ticketNo?: string
  ticket_no?: string
  requesterId?: string
  requester_id?: string
  requesterUsername?: string
  requester_username?: string
  requesterDeptId?: string
  requester_dept_id?: string
  title?: string
  description?: string
  targetSpecsJson?: string
  target_specs_json?: string
  status?: string
  resolvedProductId?: string
  resolved_product_id?: string
  resolutionNote?: string
  resolution_note?: string
  assignedTo?: string
  assigned_to?: string
  dueDate?: string
  due_date?: string
  audit?: RawAuditInfo
}

interface NormalizedAuditInfo {
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  deletedAt: string
  deletedBy: string
}

export interface NormalizedProductRequest {
  requestId: string
  ticketNo: string
  requesterId: string
  requesterUsername: string
  requesterDeptId: string
  title: string
  description: string
  targetSpecsJson: string
  status: string
  resolvedProductId: string
  resolutionNote: string
  assignedTo: string
  dueDate: string
  audit: NormalizedAuditInfo
}

function normalizeAuditInfo(raw: RawAuditInfo | undefined | null): NormalizedAuditInfo {
  return {
    createdAt: raw?.createdAt ?? raw?.created_at ?? "",
    createdBy: raw?.createdBy ?? raw?.created_by ?? "",
    updatedAt: raw?.updatedAt ?? raw?.updated_at ?? "",
    updatedBy: raw?.updatedBy ?? raw?.updated_by ?? "",
    deletedAt: raw?.deletedAt ?? raw?.deleted_at ?? "",
    deletedBy: raw?.deletedBy ?? raw?.deleted_by ?? "",
  }
}

export function normalizeProductRequest(raw: RawProductRequest): NormalizedProductRequest {
  return {
    requestId: raw.requestId ?? raw.request_id ?? "",
    ticketNo: raw.ticketNo ?? raw.ticket_no ?? "",
    requesterId: raw.requesterId ?? raw.requester_id ?? "",
    requesterUsername: raw.requesterUsername ?? raw.requester_username ?? "",
    requesterDeptId: raw.requesterDeptId ?? raw.requester_dept_id ?? "",
    title: raw.title ?? "",
    description: raw.description ?? "",
    targetSpecsJson: raw.targetSpecsJson ?? raw.target_specs_json ?? "",
    status: raw.status ?? "",
    resolvedProductId: raw.resolvedProductId ?? raw.resolved_product_id ?? "",
    resolutionNote: raw.resolutionNote ?? raw.resolution_note ?? "",
    assignedTo: raw.assignedTo ?? raw.assigned_to ?? "",
    dueDate: raw.dueDate ?? raw.due_date ?? "",
    audit: normalizeAuditInfo(raw.audit),
  }
}

/**
 * Safely parses the target_specs_json string into a record.
 * Returns null if the string is empty or invalid JSON.
 */
export function parseTargetSpecs(json: string): Record<string, unknown> | null {
  if (!json) return null
  try {
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}
