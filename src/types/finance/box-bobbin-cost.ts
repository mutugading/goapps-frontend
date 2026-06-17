// BoxBobbinCost Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Entity and Request/Response types (as type-only exports)
export type {
  BoxBobbinCost,
  BoxBobbinCostRate,
  CreateBoxBobbinCostRequest,
  CreateBoxBobbinCostResponse,
  GetBoxBobbinCostRequest,
  GetBoxBobbinCostResponse,
  UpdateBoxBobbinCostRequest,
  UpdateBoxBobbinCostResponse,
  DeleteBoxBobbinCostRequest,
  DeleteBoxBobbinCostResponse,
  ListBoxBobbinCostsRequest,
  ListBoxBobbinCostsResponse,
  ExportBoxBobbinCostsRequest,
  ExportBoxBobbinCostsResponse,
  ImportBoxBobbinCostsRequest,
  ImportBoxBobbinCostsResponse,
  DownloadBoxBobbinCostTemplateRequest,
  DownloadBoxBobbinCostTemplateResponse,
} from "@/types/generated/finance/v1/yarn_master"

// Message functions for parsing (named exports as Parsers)
export {
  BoxBobbinCost as BoxBobbinCostParser,
  CreateBoxBobbinCostResponse as CreateBoxBobbinCostResponseParser,
  GetBoxBobbinCostResponse as GetBoxBobbinCostResponseParser,
  UpdateBoxBobbinCostResponse as UpdateBoxBobbinCostResponseParser,
  DeleteBoxBobbinCostResponse as DeleteBoxBobbinCostResponseParser,
  ListBoxBobbinCostsResponse as ListBoxBobbinCostsResponseParser,
  ExportBoxBobbinCostsResponse as ExportBoxBobbinCostsResponseParser,
  ImportBoxBobbinCostsResponse as ImportBoxBobbinCostsResponseParser,
  DownloadBoxBobbinCostTemplateResponse as DownloadBoxBobbinCostTemplateResponseParser,
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

export interface ListBoxBobbinCostsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

export interface ExportBoxBobbinCostsParams {
  activeFilter?: ActiveFilter
}

// ============================================================================
// Form Types
// ============================================================================

export interface BoxBobbinCostFormData {
  bbcCode: string
  bbcName: string
  description: string
  isActive: boolean
}

export const DEFAULT_BOX_BOBBIN_COST_FORM_VALUES: BoxBobbinCostFormData = {
  bbcCode: "",
  bbcName: "",
  description: "",
  isActive: true,
}

// ============================================================================
// UI Options
// ============================================================================

export const ACTIVE_FILTER_OPTIONS = [
  { value: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED, label: "All Status" },
  { value: ActiveFilter.ACTIVE_FILTER_ACTIVE, label: "Active" },
  { value: ActiveFilter.ACTIVE_FILTER_INACTIVE, label: "Inactive" },
]
