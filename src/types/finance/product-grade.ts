// ProductGrade Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Entity and Request/Response types (as type-only exports)
export type {
  ProductGrade,
  CreateProductGradeRequest,
  CreateProductGradeResponse,
  GetProductGradeRequest,
  GetProductGradeResponse,
  UpdateProductGradeRequest,
  UpdateProductGradeResponse,
  DeleteProductGradeRequest,
  DeleteProductGradeResponse,
  ListProductGradesRequest,
  ListProductGradesResponse,
  ExportProductGradesRequest,
  ExportProductGradesResponse,
  ImportProductGradesRequest,
  ImportProductGradesResponse,
  DownloadProductGradeTemplateRequest,
  DownloadProductGradeTemplateResponse,
} from "@/types/generated/finance/v1/yarn_master"

// Message functions for parsing (named exports as Parsers)
export {
  ProductGrade as ProductGradeParser,
  CreateProductGradeResponse as CreateProductGradeResponseParser,
  GetProductGradeResponse as GetProductGradeResponseParser,
  UpdateProductGradeResponse as UpdateProductGradeResponseParser,
  DeleteProductGradeResponse as DeleteProductGradeResponseParser,
  ListProductGradesResponse as ListProductGradesResponseParser,
  ExportProductGradesResponse as ExportProductGradesResponseParser,
  ImportProductGradesResponse as ImportProductGradesResponseParser,
  DownloadProductGradeTemplateResponse as DownloadProductGradeTemplateResponseParser,
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

export interface ListProductGradesParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

export interface ExportProductGradesParams {
  activeFilter?: ActiveFilter
}

// ============================================================================
// Form Types
// ============================================================================

export interface ProductGradeFormData {
  gradeCode: string
  gradeName: string
  description: string
  isActive: boolean
}

export const DEFAULT_PRODUCT_GRADE_FORM_VALUES: ProductGradeFormData = {
  gradeCode: "",
  gradeName: "",
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
