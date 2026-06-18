// Intermingling Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Entity and Request/Response types (as type-only exports)
export type {
  Intermingling,
  CreateInterminglingRequest,
  CreateInterminglingResponse,
  GetInterminglingRequest,
  GetInterminglingResponse,
  UpdateInterminglingRequest,
  UpdateInterminglingResponse,
  DeleteInterminglingRequest,
  DeleteInterminglingResponse,
  ListInterminglingsRequest,
  ListInterminglingsResponse,
  ExportInterminglingsRequest,
  ExportInterminglingsResponse,
  ImportInterminglingsRequest,
  ImportInterminglingsResponse,
  DownloadInterminglingTemplateRequest,
  DownloadInterminglingTemplateResponse,
} from "@/types/generated/finance/v1/yarn_master"

// Message functions for parsing (named exports as Parsers)
export {
  Intermingling as InterminglingParser,
  CreateInterminglingResponse as CreateInterminglingResponseParser,
  GetInterminglingResponse as GetInterminglingResponseParser,
  UpdateInterminglingResponse as UpdateInterminglingResponseParser,
  DeleteInterminglingResponse as DeleteInterminglingResponseParser,
  ListInterminglingsResponse as ListInterminglingsResponseParser,
  ExportInterminglingsResponse as ExportInterminglingsResponseParser,
  ImportInterminglingsResponse as ImportInterminglingsResponseParser,
  DownloadInterminglingTemplateResponse as DownloadInterminglingTemplateResponseParser,
} from "@/types/generated/finance/v1/yarn_master"

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

export interface ListInterminglingsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

export interface ExportInterminglingsParams {
  activeFilter?: ActiveFilter
}

// ============================================================================
// Form Types
// ============================================================================

export interface InterminglingFormData {
  interminglingCode: string
  interminglingName: string
  description: string
  isActive: boolean
}

export const DEFAULT_INTERMINGLING_FORM_VALUES: InterminglingFormData = {
  interminglingCode: "",
  interminglingName: "",
  description: "",
  isActive: true,
}

// ============================================================================
// UI Option Lists
// ============================================================================

export const ACTIVE_FILTER_OPTIONS = [
  { value: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED, label: "All Status" },
  { value: ActiveFilter.ACTIVE_FILTER_ACTIVE, label: "Active" },
  { value: ActiveFilter.ACTIVE_FILTER_INACTIVE, label: "Inactive" },
]
