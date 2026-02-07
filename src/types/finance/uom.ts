// UOM Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Enums
export {
  UOMCategory,
  ActiveFilter,
  uOMCategoryFromJSON,
  uOMCategoryToJSON,
  activeFilterFromJSON,
  activeFilterToJSON,
} from "@/types/generated/finance/v1/uom"

// Entity and Request/Response types (as type-only exports)
export type {
  UOM,
  CreateUOMRequest,
  CreateUOMResponse,
  GetUOMRequest,
  GetUOMResponse,
  UpdateUOMRequest,
  UpdateUOMResponse,
  DeleteUOMRequest,
  DeleteUOMResponse,
  ListUOMsRequest,
  ListUOMsResponse,
  ExportUOMsRequest,
  ExportUOMsResponse,
  ImportUOMsRequest,
  ImportUOMsResponse,
  ImportError,
  DownloadTemplateRequest,
  DownloadTemplateResponse,
} from "@/types/generated/finance/v1/uom"

// Message functions for parsing (named exports as Parsers)
export {
  UOM as UOMParser,
  CreateUOMRequest as CreateUOMRequestParser,
  CreateUOMResponse as CreateUOMResponseParser,
  GetUOMRequest as GetUOMRequestParser,
  GetUOMResponse as GetUOMResponseParser,
  UpdateUOMRequest as UpdateUOMRequestParser,
  UpdateUOMResponse as UpdateUOMResponseParser,
  DeleteUOMRequest as DeleteUOMRequestParser,
  DeleteUOMResponse as DeleteUOMResponseParser,
  ListUOMsRequest as ListUOMsRequestParser,
  ListUOMsResponse as ListUOMsResponseParser,
  ExportUOMsRequest as ExportUOMsRequestParser,
  ExportUOMsResponse as ExportUOMsResponseParser,
  ImportUOMsRequest as ImportUOMsRequestParser,
  ImportUOMsResponse as ImportUOMsResponseParser,
  ImportError as ImportErrorParser,
  DownloadTemplateRequest as DownloadTemplateRequestParser,
  DownloadTemplateResponse as DownloadTemplateResponseParser,
} from "@/types/generated/finance/v1/uom"

// Re-export common types from proto
export type {
  BaseResponse,
  PaginationResponse,
  ValidationError,
  AuditInfo,
} from "@/types/generated/common/v1/common"

export {
  BaseResponse as BaseResponseParser,
  PaginationResponse as PaginationResponseParser,
  ValidationError as ValidationErrorParser,
  AuditInfo as AuditInfoParser,
} from "@/types/generated/common/v1/common"

// ============================================================================
// Import for local use
// ============================================================================

import {
  UOMCategory,
  ActiveFilter,
} from "@/types/generated/finance/v1/uom"

// ============================================================================
// UI Display Labels
// ============================================================================

/**
 * Category display labels for UI
 */
export const UOM_CATEGORY_LABELS: Record<UOMCategory, string> = {
  [UOMCategory.UOM_CATEGORY_UNSPECIFIED]: "All Categories",
  [UOMCategory.UOM_CATEGORY_WEIGHT]: "Weight",
  [UOMCategory.UOM_CATEGORY_LENGTH]: "Length",
  [UOMCategory.UOM_CATEGORY_VOLUME]: "Volume",
  [UOMCategory.UOM_CATEGORY_QUANTITY]: "Quantity",
  [UOMCategory.UNRECOGNIZED]: "Unknown",
}

/**
 * Active filter display labels for UI
 */
export const ACTIVE_FILTER_LABELS: Record<ActiveFilter, string> = {
  [ActiveFilter.ACTIVE_FILTER_UNSPECIFIED]: "All Status",
  [ActiveFilter.ACTIVE_FILTER_ACTIVE]: "Active",
  [ActiveFilter.ACTIVE_FILTER_INACTIVE]: "Inactive",
  [ActiveFilter.UNRECOGNIZED]: "Unknown",
}

/**
 * Category options for select inputs
 */
export const UOM_CATEGORY_OPTIONS = [
  { value: UOMCategory.UOM_CATEGORY_UNSPECIFIED, label: "All Categories" },
  { value: UOMCategory.UOM_CATEGORY_WEIGHT, label: "Weight" },
  { value: UOMCategory.UOM_CATEGORY_LENGTH, label: "Length" },
  { value: UOMCategory.UOM_CATEGORY_VOLUME, label: "Volume" },
  { value: UOMCategory.UOM_CATEGORY_QUANTITY, label: "Quantity" },
]

/**
 * Category options for create/edit forms (excludes UNSPECIFIED)
 */
export const UOM_CATEGORY_FORM_OPTIONS = UOM_CATEGORY_OPTIONS.filter(
  (opt) => opt.value !== UOMCategory.UOM_CATEGORY_UNSPECIFIED
)

/**
 * Active filter options for select inputs
 */
export const ACTIVE_FILTER_OPTIONS = [
  { value: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED, label: "All Status" },
  { value: ActiveFilter.ACTIVE_FILTER_ACTIVE, label: "Active" },
  { value: ActiveFilter.ACTIVE_FILTER_INACTIVE, label: "Inactive" },
]

// ============================================================================
// Simplified Params Types for Hooks
// ============================================================================

/**
 * Simplified list params for hooks (uses numeric enums from proto)
 */
export interface ListUOMsParams {
  page?: number
  pageSize?: number
  search?: string
  category?: UOMCategory
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

/**
 * Simplified export params for hooks
 */
export interface ExportUOMsParams {
  category?: UOMCategory
  activeFilter?: ActiveFilter
}

/**
 * Duplicate action for imports
 */
export type DuplicateAction = "skip" | "update" | "error"

// ============================================================================
// Form Types
// ============================================================================

/**
 * Form data for UOM create/edit forms
 */
export interface UOMFormData {
  uomCode: string
  uomName: string
  uomCategory: UOMCategory
  description: string
  isActive: boolean
}

/**
 * Default form values for creating a new UOM
 */
export const DEFAULT_UOM_FORM_VALUES: UOMFormData = {
  uomCode: "",
  uomName: "",
  uomCategory: UOMCategory.UOM_CATEGORY_WEIGHT,
  description: "",
  isActive: true,
}
