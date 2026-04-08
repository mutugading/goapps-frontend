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
