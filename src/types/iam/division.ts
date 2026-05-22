// Division Types - Re-export from proto-generated types with UI helpers

export type {
  Division,
  CreateDivisionRequest,
  CreateDivisionResponse,
  GetDivisionRequest,
  GetDivisionResponse,
  UpdateDivisionRequest,
  UpdateDivisionResponse,
  DeleteDivisionRequest,
  DeleteDivisionResponse,
  ListDivisionsRequest,
  ListDivisionsResponse,
} from "@/types/generated/iam/v1/organization"

export {
  Division as DivisionParser,
  CreateDivisionResponse as CreateDivisionResponseParser,
  GetDivisionResponse as GetDivisionResponseParser,
  UpdateDivisionResponse as UpdateDivisionResponseParser,
  DeleteDivisionResponse as DeleteDivisionResponseParser,
  ListDivisionsResponse as ListDivisionsResponseParser,
} from "@/types/generated/iam/v1/organization"

export {
  ActiveFilter,
} from "@/types/generated/iam/v1/user"

import { ActiveFilter } from "@/types/generated/iam/v1/user"

export interface ListDivisionsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  companyId?: string
  sortBy?: string
  sortOrder?: string
}

export interface DivisionFormData {
  companyId: string
  divisionCode: string
  divisionName: string
  description: string
  isActive: boolean
}

export const DEFAULT_DIVISION_FORM_VALUES: DivisionFormData = {
  companyId: "",
  divisionCode: "",
  divisionName: "",
  description: "",
  isActive: true,
}
