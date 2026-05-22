// Company Types - Re-export from proto-generated types with UI helpers

export type {
  Company,
  CreateCompanyRequest,
  CreateCompanyResponse,
  GetCompanyRequest,
  GetCompanyResponse,
  UpdateCompanyRequest,
  UpdateCompanyResponse,
  DeleteCompanyRequest,
  DeleteCompanyResponse,
  ListCompaniesRequest,
  ListCompaniesResponse,
} from "@/types/generated/iam/v1/organization"

export {
  Company as CompanyParser,
  CreateCompanyResponse as CreateCompanyResponseParser,
  GetCompanyResponse as GetCompanyResponseParser,
  UpdateCompanyResponse as UpdateCompanyResponseParser,
  DeleteCompanyResponse as DeleteCompanyResponseParser,
  ListCompaniesResponse as ListCompaniesResponseParser,
} from "@/types/generated/iam/v1/organization"

export {
  ActiveFilter,
} from "@/types/generated/iam/v1/user"

import { ActiveFilter } from "@/types/generated/iam/v1/user"

export interface ListCompaniesParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

export interface CompanyFormData {
  companyCode: string
  companyName: string
  description: string
  isActive: boolean
}

export const DEFAULT_COMPANY_FORM_VALUES: CompanyFormData = {
  companyCode: "",
  companyName: "",
  description: "",
  isActive: true,
}
