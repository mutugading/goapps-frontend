// Employee Level Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

export type {
  EmployeeLevel,
  CreateEmployeeLevelRequest,
  CreateEmployeeLevelResponse,
  GetEmployeeLevelRequest,
  GetEmployeeLevelResponse,
  UpdateEmployeeLevelRequest,
  UpdateEmployeeLevelResponse,
  DeleteEmployeeLevelRequest,
  DeleteEmployeeLevelResponse,
  ListEmployeeLevelsRequest,
  ListEmployeeLevelsResponse,
  ExportEmployeeLevelsRequest,
  ExportEmployeeLevelsResponse,
  ImportEmployeeLevelsRequest,
  ImportEmployeeLevelsResponse,
  DownloadEmployeeLevelTemplateRequest,
  DownloadEmployeeLevelTemplateResponse,
  SubmitEmployeeLevelRequest,
  SubmitEmployeeLevelResponse,
  ApproveEmployeeLevelRequest,
  ApproveEmployeeLevelResponse,
  ReleaseEmployeeLevelRequest,
  ReleaseEmployeeLevelResponse,
  BypassReleaseEmployeeLevelRequest,
  BypassReleaseEmployeeLevelResponse,
} from "@/types/generated/iam/v1/employee_level"

export {
  EmployeeLevel as EmployeeLevelParser,
  CreateEmployeeLevelResponse as CreateEmployeeLevelResponseParser,
  GetEmployeeLevelResponse as GetEmployeeLevelResponseParser,
  UpdateEmployeeLevelResponse as UpdateEmployeeLevelResponseParser,
  DeleteEmployeeLevelResponse as DeleteEmployeeLevelResponseParser,
  ListEmployeeLevelsResponse as ListEmployeeLevelsResponseParser,
  EmployeeLevelType,
  employeeLevelTypeFromJSON,
  employeeLevelTypeToJSON,
  EmployeeLevelWorkflow,
  employeeLevelWorkflowFromJSON,
  employeeLevelWorkflowToJSON,
} from "@/types/generated/iam/v1/employee_level"

export {
  ActiveFilter,
  activeFilterFromJSON,
  activeFilterToJSON,
} from "@/types/generated/iam/v1/user"

export type {
  BaseResponse,
  PaginationResponse,
} from "@/types/generated/common/v1/common"

// ============================================================================
// Local imports
// ============================================================================

import { ActiveFilter } from "@/types/generated/iam/v1/user"
import {
  EmployeeLevelType,
  EmployeeLevelWorkflow,
} from "@/types/generated/iam/v1/employee_level"

// ============================================================================
// UI Display Labels
// ============================================================================

export const EMPLOYEE_LEVEL_TYPE_LABELS: Record<EmployeeLevelType, string> = {
  [EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_UNSPECIFIED]: "—",
  [EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_EXECUTIVE]: "Executive",
  [EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_NON_EXECUTIVE]: "Non-Executive",
  [EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_OPERATOR]: "Operator",
  [EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_OTHER]: "Other",
  [EmployeeLevelType.UNRECOGNIZED]: "Unknown",
}

export const EMPLOYEE_LEVEL_WORKFLOW_LABELS: Record<EmployeeLevelWorkflow, string> = {
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_UNSPECIFIED]: "—",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_DRAFT]: "Draft",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_SUBMITTED]: "Submitted",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_APPROVED]: "Approved",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_RELEASED]: "Released",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_SUPER_USER]: "Super User",
  [EmployeeLevelWorkflow.UNRECOGNIZED]: "Unknown",
}

export const EMPLOYEE_LEVEL_TYPE_OPTIONS = [
  { value: EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_EXECUTIVE, label: "Executive" },
  { value: EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_NON_EXECUTIVE, label: "Non-Executive" },
  { value: EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_OPERATOR, label: "Operator" },
  { value: EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_OTHER, label: "Other" },
] as const

export const EMPLOYEE_LEVEL_WORKFLOW_OPTIONS = [
  { value: EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_DRAFT, label: "Draft" },
  { value: EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_SUBMITTED, label: "Submitted" },
  { value: EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_APPROVED, label: "Approved" },
  { value: EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_RELEASED, label: "Released" },
  { value: EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_SUPER_USER, label: "Super User" },
] as const

export const EMPLOYEE_LEVEL_WORKFLOW_BADGE_VARIANT: Record<EmployeeLevelWorkflow, "default" | "secondary" | "outline" | "destructive"> = {
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_UNSPECIFIED]: "outline",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_DRAFT]: "secondary",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_SUBMITTED]: "outline",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_APPROVED]: "default",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_RELEASED]: "default",
  [EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_SUPER_USER]: "destructive",
  [EmployeeLevelWorkflow.UNRECOGNIZED]: "outline",
}

export interface WorkflowTransitionParams {
  employeeLevelId: string
  notes?: string
}

// ============================================================================
// Simplified Params
// ============================================================================

export interface ListEmployeeLevelsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  type?: EmployeeLevelType
  workflow?: EmployeeLevelWorkflow
  sortBy?: string
  sortOrder?: string
}

// ============================================================================
// Form Types
// ============================================================================

export interface EmployeeLevelFormData {
  code: string
  name: string
  grade: number
  type: EmployeeLevelType
  sequence: number
  workflow: EmployeeLevelWorkflow
  isActive: boolean
}

export const DEFAULT_EMPLOYEE_LEVEL_FORM_VALUES: EmployeeLevelFormData = {
  code: "",
  name: "",
  grade: 0,
  type: EmployeeLevelType.EMPLOYEE_LEVEL_TYPE_EXECUTIVE,
  sequence: 0,
  workflow: EmployeeLevelWorkflow.EMPLOYEE_LEVEL_WORKFLOW_DRAFT,
  isActive: true,
}
