// Formula Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Enums
export {
  FormulaType,
  formulaTypeFromJSON,
  formulaTypeToJSON,
} from "@/types/generated/finance/v1/formula"

// Import ActiveFilter from uom (shared enum, already exported via uom.ts)
import {
  ActiveFilter,
} from "@/types/generated/finance/v1/uom"

// Entity and Request/Response types (as type-only exports)
export type {
  Formula,
  FormulaParam,
  CreateFormulaRequest,
  CreateFormulaResponse,
  GetFormulaRequest,
  GetFormulaResponse,
  UpdateFormulaRequest,
  UpdateFormulaResponse,
  DeleteFormulaRequest,
  DeleteFormulaResponse,
  ListFormulasRequest,
  ListFormulasResponse,
  ExportFormulasRequest,
  ExportFormulasResponse,
  ImportFormulasRequest,
  ImportFormulasResponse,
  DownloadFormulaTemplateRequest,
  DownloadFormulaTemplateResponse,
} from "@/types/generated/finance/v1/formula"

// ImportError is shared from uom (re-exported via uom.ts barrel)
export type { ImportError } from "@/types/generated/finance/v1/uom"

// Message functions for parsing (named exports as Parsers)
export {
  Formula as FormulaParser,
  FormulaParam as FormulaParamParser,
  CreateFormulaRequest as CreateFormulaRequestParser,
  CreateFormulaResponse as CreateFormulaResponseParser,
  GetFormulaRequest as GetFormulaRequestParser,
  GetFormulaResponse as GetFormulaResponseParser,
  UpdateFormulaRequest as UpdateFormulaRequestParser,
  UpdateFormulaResponse as UpdateFormulaResponseParser,
  DeleteFormulaRequest as DeleteFormulaRequestParser,
  DeleteFormulaResponse as DeleteFormulaResponseParser,
  ListFormulasRequest as ListFormulasRequestParser,
  ListFormulasResponse as ListFormulasResponseParser,
  ExportFormulasRequest as ExportFormulasRequestParser,
  ExportFormulasResponse as ExportFormulasResponseParser,
  ImportFormulasRequest as ImportFormulasRequestParser,
  ImportFormulasResponse as ImportFormulasResponseParser,
  DownloadFormulaTemplateRequest as DownloadFormulaTemplateRequestParser,
  DownloadFormulaTemplateResponse as DownloadFormulaTemplateResponseParser,
} from "@/types/generated/finance/v1/formula"

export { ImportError as ImportErrorParser } from "@/types/generated/finance/v1/uom"

// Re-export common types from proto
export type {
  BaseResponse,
  PaginationResponse,
  AuditInfo,
} from "@/types/generated/common/v1/common"

export {
  BaseResponse as BaseResponseParser,
  PaginationResponse as PaginationResponseParser,
  AuditInfo as AuditInfoParser,
} from "@/types/generated/common/v1/common"

// ============================================================================
// Import for local use
// ============================================================================

import {
  FormulaType,
} from "@/types/generated/finance/v1/formula"

// ============================================================================
// UI Display Labels
// ============================================================================

export const FORMULA_TYPE_LABELS: Record<FormulaType, string> = {
  [FormulaType.FORMULA_TYPE_UNSPECIFIED]: "All Types",
  [FormulaType.FORMULA_TYPE_CALCULATION]: "Calculation",
  [FormulaType.FORMULA_TYPE_SQL_QUERY]: "SQL Query",
  [FormulaType.FORMULA_TYPE_CONSTANT]: "Constant",
  [FormulaType.UNRECOGNIZED]: "Unknown",
}

export const FORMULA_TYPE_OPTIONS = [
  { value: FormulaType.FORMULA_TYPE_UNSPECIFIED, label: "All Types" },
  { value: FormulaType.FORMULA_TYPE_CALCULATION, label: "Calculation" },
  { value: FormulaType.FORMULA_TYPE_SQL_QUERY, label: "SQL Query" },
  { value: FormulaType.FORMULA_TYPE_CONSTANT, label: "Constant" },
]

export const FORMULA_TYPE_FORM_OPTIONS = FORMULA_TYPE_OPTIONS.filter(
  (opt) => opt.value !== FormulaType.FORMULA_TYPE_UNSPECIFIED
)

export const FORMULA_ACTIVE_FILTER_OPTIONS = [
  { value: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED, label: "All Status" },
  { value: ActiveFilter.ACTIVE_FILTER_ACTIVE, label: "Active" },
  { value: ActiveFilter.ACTIVE_FILTER_INACTIVE, label: "Inactive" },
]

// ============================================================================
// Simplified Params Types for Hooks
// ============================================================================

export interface ListFormulasParams {
  page?: number
  pageSize?: number
  search?: string
  formulaType?: FormulaType
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

export interface ExportFormulasParams {
  formulaType?: FormulaType
  activeFilter?: ActiveFilter
}

export type FormulaDuplicateAction = "skip" | "update" | "error"

// ============================================================================
// Form Types
// ============================================================================

export interface FormulaFormData {
  formulaCode: string
  formulaName: string
  formulaType: FormulaType
  expression: string
  resultParamId: string
  inputParamIds: string[]
  description: string
  isActive: boolean
}

export const DEFAULT_FORMULA_FORM_VALUES: FormulaFormData = {
  formulaCode: "",
  formulaName: "",
  formulaType: FormulaType.FORMULA_TYPE_CALCULATION,
  expression: "",
  resultParamId: "",
  inputParamIds: [],
  description: "",
  isActive: true,
}
