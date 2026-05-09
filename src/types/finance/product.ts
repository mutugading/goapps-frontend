// Product Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types (type-only)
// ============================================================================

export type {
  Product,
  CopyOptions,
  CreateProductRequest,
  CreateProductResponse,
  GetProductRequest,
  GetProductResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  DeleteProductRequest,
  DeleteProductResponse,
  DuplicateProductRequest,
  DuplicateProductResponse,
  ListProductsRequest,
  ListProductsResponse,
  ListProductsByRequestRequest,
  ListProductsByRequestResponse,
} from "@/types/generated/finance/v1/product"

// Message functions for parsing (XParser convention)
export {
  Product as ProductParser,
  CopyOptions as CopyOptionsParser,
  CreateProductRequest as CreateProductRequestParser,
  CreateProductResponse as CreateProductResponseParser,
  GetProductRequest as GetProductRequestParser,
  GetProductResponse as GetProductResponseParser,
  UpdateProductRequest as UpdateProductRequestParser,
  UpdateProductResponse as UpdateProductResponseParser,
  DeleteProductRequest as DeleteProductRequestParser,
  DeleteProductResponse as DeleteProductResponseParser,
  DuplicateProductRequest as DuplicateProductRequestParser,
  DuplicateProductResponse as DuplicateProductResponseParser,
  ListProductsRequest as ListProductsRequestParser,
  ListProductsResponse as ListProductsResponseParser,
  ListProductsByRequestRequest as ListProductsByRequestRequestParser,
  ListProductsByRequestResponse as ListProductsByRequestResponseParser,
} from "@/types/generated/finance/v1/product"

// ============================================================================
// UI Display Labels
// ============================================================================

export const PRODUCT_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PARAM_PENDING: "Param Pending",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
}

export const WORKFLOW_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  CONFIRMED: "Confirmed",
  LOCKED: "Locked",
  UNLOCK_REQUESTED: "Unlock Requested",
}

export const PURPOSE_LABEL: Record<string, string> = {
  COMMERCIAL: "Commercial",
  TESTING: "Testing",
  TRIAL: "Trial",
}

export const PRODUCT_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PARAM_PENDING", label: "Param Pending" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
] as const

export const WORKFLOW_STATUS_OPTIONS = [
  { value: "", label: "All Workflow Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "LOCKED", label: "Locked" },
  { value: "UNLOCK_REQUESTED", label: "Unlock Requested" },
] as const

export const PURPOSE_OPTIONS = [
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "TESTING", label: "Testing" },
  { value: "TRIAL", label: "Trial" },
] as const

// Badge color variants for shadcn Badge — match ui/badge variant props
export const PRODUCT_STATUS_BADGE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary",
  PARAM_PENDING: "outline",
  ACTIVE: "default",
  INACTIVE: "destructive",
}

export const WORKFLOW_STATUS_BADGE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  DRAFT: "secondary",
  SUBMITTED: "outline",
  CONFIRMED: "default",
  LOCKED: "default",
  UNLOCK_REQUESTED: "destructive",
}

// ============================================================================
// Simplified Params for Hooks
// ============================================================================

export interface ListProductsParams {
  page?: number
  pageSize?: number
  search?: string
  workflowStatus?: string
  productStatus?: string
  purpose?: string
  createdByDeptId?: string
  sortField?: string
  sortDesc?: boolean
}

export interface CreateProductParams {
  productCode: string
  productName: string
  productItemCode: string
  productShadeCode?: string
  productShadeName?: string
  createdByDeptId: string
  purpose: string
  currentRequestId?: string
}

export interface UpdateProductParams {
  productId: string
  productName: string
  productShadeCode?: string
  productShadeName?: string
  purpose: string
}

export interface DuplicateProductParams {
  sourceProductId: string
  productCode: string
  productName: string
  duplicationNote?: string
  options: {
    includeValues: boolean
    includeRouting: boolean
    includeRm: boolean
    includeAttachments: boolean
  }
  currentRequestId?: string
}

// ============================================================================
// Normalizer (handles both camelCase + snake_case from BFF responses)
// Note: Audit helpers are kept private to avoid barrel export conflicts.
// ============================================================================

interface RawCopyOptions {
  includeValues?: boolean
  include_values?: boolean
  includeRouting?: boolean
  include_routing?: boolean
  includeRm?: boolean
  include_rm?: boolean
  includeAttachments?: boolean
  include_attachments?: boolean
}

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

export interface RawProduct {
  productId?: string
  product_id?: string
  productCode?: string
  product_code?: string
  productName?: string
  product_name?: string
  productItemCode?: string
  product_item_code?: string
  productShadeCode?: string
  product_shade_code?: string
  productShadeName?: string
  product_shade_name?: string
  productStatus?: string
  product_status?: string
  workflowStatus?: string
  workflow_status?: string
  createdByDeptId?: string
  created_by_dept_id?: string
  createdByDeptCode?: string
  created_by_dept_code?: string
  purpose?: string
  duplicatedFromId?: string
  duplicated_from_id?: string
  duplicationNote?: string
  duplication_note?: string
  copiedWithOptions?: RawCopyOptions
  copied_with_options?: RawCopyOptions
  currentRequestId?: string
  current_request_id?: string
  audit?: RawAuditInfo
}

export interface NormalizedAuditInfo {
  createdAt: string
  createdBy: string
  updatedAt: string
  updatedBy: string
  deletedAt: string
  deletedBy: string
}

export interface NormalizedCopyOptions {
  includeValues: boolean
  includeRouting: boolean
  includeRm: boolean
  includeAttachments: boolean
}

export interface NormalizedProduct {
  productId: string
  productCode: string
  productName: string
  productItemCode: string
  productShadeCode: string
  productShadeName: string
  productStatus: string
  workflowStatus: string
  createdByDeptId: string
  createdByDeptCode: string
  purpose: string
  duplicatedFromId: string
  duplicationNote: string
  copiedWithOptions: NormalizedCopyOptions | null
  currentRequestId: string
  audit: NormalizedAuditInfo
}

function normalizeCopyOptions(raw: RawCopyOptions | undefined | null): NormalizedCopyOptions | null {
  if (!raw) return null
  return {
    includeValues: raw.includeValues ?? raw.include_values ?? false,
    includeRouting: raw.includeRouting ?? raw.include_routing ?? false,
    includeRm: raw.includeRm ?? raw.include_rm ?? false,
    includeAttachments: raw.includeAttachments ?? raw.include_attachments ?? false,
  }
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

export function normalizeProduct(raw: RawProduct): NormalizedProduct {
  return {
    productId: raw.productId ?? raw.product_id ?? "",
    productCode: raw.productCode ?? raw.product_code ?? "",
    productName: raw.productName ?? raw.product_name ?? "",
    productItemCode: raw.productItemCode ?? raw.product_item_code ?? "",
    productShadeCode: raw.productShadeCode ?? raw.product_shade_code ?? "",
    productShadeName: raw.productShadeName ?? raw.product_shade_name ?? "",
    productStatus: raw.productStatus ?? raw.product_status ?? "",
    workflowStatus: raw.workflowStatus ?? raw.workflow_status ?? "",
    createdByDeptId: raw.createdByDeptId ?? raw.created_by_dept_id ?? "",
    createdByDeptCode: raw.createdByDeptCode ?? raw.created_by_dept_code ?? "",
    purpose: raw.purpose ?? "",
    duplicatedFromId: raw.duplicatedFromId ?? raw.duplicated_from_id ?? "",
    duplicationNote: raw.duplicationNote ?? raw.duplication_note ?? "",
    copiedWithOptions: normalizeCopyOptions(raw.copiedWithOptions ?? raw.copied_with_options),
    currentRequestId: raw.currentRequestId ?? raw.current_request_id ?? "",
    audit: normalizeAuditInfo(raw.audit),
  }
}
