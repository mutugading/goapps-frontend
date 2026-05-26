// Department Types - Re-export from proto-generated types with UI helpers

export type {
  Department,
  CreateDepartmentRequest,
  CreateDepartmentResponse,
  GetDepartmentRequest,
  GetDepartmentResponse,
  UpdateDepartmentRequest,
  UpdateDepartmentResponse,
  DeleteDepartmentRequest,
  DeleteDepartmentResponse,
  ListDepartmentsRequest,
  ListDepartmentsResponse,
} from "@/types/generated/iam/v1/organization"

export {
  Department as DepartmentParser,
  CreateDepartmentResponse as CreateDepartmentResponseParser,
  GetDepartmentResponse as GetDepartmentResponseParser,
  UpdateDepartmentResponse as UpdateDepartmentResponseParser,
  DeleteDepartmentResponse as DeleteDepartmentResponseParser,
  ListDepartmentsResponse as ListDepartmentsResponseParser,
} from "@/types/generated/iam/v1/organization"

export {
  ActiveFilter,
} from "@/types/generated/iam/v1/user"

import { ActiveFilter } from "@/types/generated/iam/v1/user"

export interface ListDepartmentsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  companyId?: string
  divisionId?: string
  sortBy?: string
  sortOrder?: string
}

export interface DepartmentFormData {
  divisionId: string
  departmentCode: string
  departmentName: string
  description: string
  isActive: boolean
}

export const DEFAULT_DEPARTMENT_FORM_VALUES: DepartmentFormData = {
  divisionId: "",
  departmentCode: "",
  departmentName: "",
  description: "",
  isActive: true,
}
