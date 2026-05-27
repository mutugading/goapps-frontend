// Employee Group Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

export type {
  EmployeeGroup,
  CreateEmployeeGroupRequest,
  CreateEmployeeGroupResponse,
  GetEmployeeGroupRequest,
  GetEmployeeGroupResponse,
  UpdateEmployeeGroupRequest,
  UpdateEmployeeGroupResponse,
  DeleteEmployeeGroupRequest,
  DeleteEmployeeGroupResponse,
  ListEmployeeGroupsRequest,
  ListEmployeeGroupsResponse,
  ExportEmployeeGroupsRequest,
  ExportEmployeeGroupsResponse,
  ImportEmployeeGroupsRequest,
  ImportEmployeeGroupsResponse,
  DownloadEmployeeGroupTemplateRequest,
  DownloadEmployeeGroupTemplateResponse,
} from "@/types/generated/iam/v1/employee_group"

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

// ============================================================================
// Simplified Params
// ============================================================================

export interface ListEmployeeGroupsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

// ============================================================================
// Form Types
// ============================================================================

export interface EmployeeGroupFormData {
  code: string
  name: string
  isActive: boolean
}

export const DEFAULT_EMPLOYEE_GROUP_FORM_VALUES: EmployeeGroupFormData = {
  code: "",
  name: "",
  isActive: true,
}
