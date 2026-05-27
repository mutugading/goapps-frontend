// Company Mapping Types - Re-export from proto-generated types with UI helpers

export type {
  CompanyMapping,
  CreateCompanyMappingRequest,
  CreateCompanyMappingResponse,
  GetCompanyMappingRequest,
  GetCompanyMappingResponse,
  UpdateCompanyMappingRequest,
  UpdateCompanyMappingResponse,
  DeleteCompanyMappingRequest,
  DeleteCompanyMappingResponse,
  ListCompanyMappingsRequest,
  ListCompanyMappingsResponse,
} from "@/types/generated/iam/v1/company_mapping"

export {
  CompanyMapping as CompanyMappingParser,
  CreateCompanyMappingResponse as CreateCompanyMappingResponseParser,
  GetCompanyMappingResponse as GetCompanyMappingResponseParser,
  UpdateCompanyMappingResponse as UpdateCompanyMappingResponseParser,
  DeleteCompanyMappingResponse as DeleteCompanyMappingResponseParser,
  ListCompanyMappingsResponse as ListCompanyMappingsResponseParser,
} from "@/types/generated/iam/v1/company_mapping"

export {
  ActiveFilter,
} from "@/types/generated/iam/v1/user"

import { ActiveFilter } from "@/types/generated/iam/v1/user"
import type { CompanyMapping } from "@/types/generated/iam/v1/company_mapping"

export interface ListCompanyMappingsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  companyId?: string
  divisionId?: string
  departmentId?: string
  sectionId?: string
  sortBy?: string
  sortOrder?: string
}

export interface CompanyMappingFormData {
  code: string
  name: string
  companyId: string
  divisionId: string
  departmentId: string
  sectionId: string
  isActive: boolean
}

export const DEFAULT_COMPANY_MAPPING_FORM_VALUES: CompanyMappingFormData = {
  code: "",
  name: "",
  companyId: "",
  divisionId: "",
  departmentId: "",
  sectionId: "",
  isActive: true,
}

/**
 * Build a human-friendly path label for a company mapping:
 * "<code> — <company> › <division> › <department>[ › <section>]"
 */
export function formatCompanyMappingPath(m: CompanyMapping): string {
  const segments = [m.companyName, m.divisionName, m.departmentName]
  if (m.sectionName) segments.push(m.sectionName)
  const path = segments.filter(Boolean).join(" › ")
  if (m.code && path) return `${m.code} — ${path}`
  if (m.code) return m.code
  return path
}
