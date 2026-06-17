// MB Head Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Entity and Request/Response types (as type-only exports)
export type {
  MBHead,
  CreateMBHeadRequest,
  CreateMBHeadResponse,
  GetMBHeadRequest,
  GetMBHeadResponse,
  UpdateMBHeadRequest,
  UpdateMBHeadResponse,
  DeleteMBHeadRequest,
  DeleteMBHeadResponse,
  ListMBHeadsRequest,
  ListMBHeadsResponse,
  ExportMBHeadsRequest,
  ExportMBHeadsResponse,
  ImportMBHeadsRequest,
  ImportMBHeadsResponse,
  DownloadMBHeadTemplateRequest,
  DownloadMBHeadTemplateResponse,
} from "@/types/generated/finance/v1/yarn_master"

// Message functions for parsing (named exports as Parsers)
export {
  MBHead as MBHeadParser,
  CreateMBHeadResponse as CreateMBHeadResponseParser,
  GetMBHeadResponse as GetMBHeadResponseParser,
  UpdateMBHeadResponse as UpdateMBHeadResponseParser,
  DeleteMBHeadResponse as DeleteMBHeadResponseParser,
  ListMBHeadsResponse as ListMBHeadsResponseParser,
  ExportMBHeadsResponse as ExportMBHeadsResponseParser,
  ImportMBHeadsResponse as ImportMBHeadsResponseParser,
  DownloadMBHeadTemplateResponse as DownloadMBHeadTemplateResponseParser,
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

export interface ListMBHeadsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

export interface ExportMBHeadsParams {
  activeFilter?: ActiveFilter
}

// ============================================================================
// Form Types
// ============================================================================

export interface MBHeadFormData {
  mbhCode: string
  mbhName: string
  description: string
  isActive: boolean
}

export const DEFAULT_MB_HEAD_FORM_VALUES: MBHeadFormData = {
  mbhCode: "",
  mbhName: "",
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
