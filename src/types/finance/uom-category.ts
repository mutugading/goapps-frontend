// UOM Category Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Entity and Request/Response types (as type-only exports)
export type {
  UOMCategory,
  CreateUOMCategoryRequest,
  CreateUOMCategoryResponse,
  GetUOMCategoryRequest,
  GetUOMCategoryResponse,
  UpdateUOMCategoryRequest,
  UpdateUOMCategoryResponse,
  DeleteUOMCategoryRequest,
  DeleteUOMCategoryResponse,
  ListUOMCategoriesRequest,
  ListUOMCategoriesResponse,
  ExportUOMCategoriesRequest,
  ExportUOMCategoriesResponse,
  ImportUOMCategoriesRequest,
  ImportUOMCategoriesResponse,
  DownloadUOMCategoryTemplateRequest,
  DownloadUOMCategoryTemplateResponse,
} from "@/types/generated/finance/v1/uom_category"

// Message functions for parsing (named exports as Parsers)
export {
  UOMCategory as UOMCategoryParser,
  CreateUOMCategoryResponse as CreateUOMCategoryResponseParser,
  GetUOMCategoryResponse as GetUOMCategoryResponseParser,
  UpdateUOMCategoryResponse as UpdateUOMCategoryResponseParser,
  DeleteUOMCategoryResponse as DeleteUOMCategoryResponseParser,
  ListUOMCategoriesResponse as ListUOMCategoriesResponseParser,
  ExportUOMCategoriesResponse as ExportUOMCategoriesResponseParser,
  ImportUOMCategoriesResponse as ImportUOMCategoriesResponseParser,
  DownloadUOMCategoryTemplateResponse as DownloadUOMCategoryTemplateResponseParser,
} from "@/types/generated/finance/v1/uom_category"

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
// Simplified Params Types for Hooks
// ============================================================================

export interface ListUOMCategoriesParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

export interface ExportUOMCategoriesParams {
  activeFilter?: ActiveFilter
}

// ============================================================================
// Form Types
// ============================================================================

export interface UOMCategoryFormData {
  categoryCode: string
  categoryName: string
  description: string
  isActive: boolean
}

export const DEFAULT_UOM_CATEGORY_FORM_VALUES: UOMCategoryFormData = {
  categoryCode: "",
  categoryName: "",
  description: "",
  isActive: true,
}
