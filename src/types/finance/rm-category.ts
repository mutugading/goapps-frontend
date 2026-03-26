// RM Category Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Entity and Request/Response types (as type-only exports)
export type {
  RMCategory,
  CreateRMCategoryRequest,
  CreateRMCategoryResponse,
  GetRMCategoryRequest,
  GetRMCategoryResponse,
  UpdateRMCategoryRequest,
  UpdateRMCategoryResponse,
  DeleteRMCategoryRequest,
  DeleteRMCategoryResponse,
  ListRMCategoriesRequest,
  ListRMCategoriesResponse,
  ExportRMCategoriesRequest,
  ExportRMCategoriesResponse,
  ImportRMCategoriesRequest,
  ImportRMCategoriesResponse,
  DownloadRMCategoryTemplateRequest,
  DownloadRMCategoryTemplateResponse,
} from "@/types/generated/finance/v1/rm_category"

// Message functions for parsing (named exports as Parsers)
export {
  RMCategory as RMCategoryParser,
  CreateRMCategoryResponse as CreateRMCategoryResponseParser,
  GetRMCategoryResponse as GetRMCategoryResponseParser,
  UpdateRMCategoryResponse as UpdateRMCategoryResponseParser,
  DeleteRMCategoryResponse as DeleteRMCategoryResponseParser,
  ListRMCategoriesResponse as ListRMCategoriesResponseParser,
  ExportRMCategoriesResponse as ExportRMCategoriesResponseParser,
  ImportRMCategoriesResponse as ImportRMCategoriesResponseParser,
  DownloadRMCategoryTemplateResponse as DownloadRMCategoryTemplateResponseParser,
} from "@/types/generated/finance/v1/rm_category"

// Re-export shared enums/types from UOM (same package)
export {
  ActiveFilter,
  activeFilterFromJSON,
  activeFilterToJSON,
} from "@/types/generated/finance/v1/uom"

export type { ImportError } from "@/types/generated/finance/v1/uom"

// Re-export common types from proto
export type {
  BaseResponse,
  PaginationResponse,
} from "@/types/generated/common/v1/common"

// ============================================================================
// Import for local use
// ============================================================================

import { ActiveFilter } from "@/types/generated/finance/v1/uom"

// ============================================================================
// UI Display Labels
// ============================================================================

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
 * Simplified list params for hooks
 */
export interface ListRMCategoriesParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

/**
 * Simplified export params for hooks
 */
export interface ExportRMCategoriesParams {
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
 * Form data for RM Category create/edit forms
 */
export interface RMCategoryFormData {
  categoryCode: string
  categoryName: string
  description: string
  isActive: boolean
}

/**
 * Default form values for creating a new RM Category
 */
export const DEFAULT_RM_CATEGORY_FORM_VALUES: RMCategoryFormData = {
  categoryCode: "",
  categoryName: "",
  description: "",
  isActive: true,
}
