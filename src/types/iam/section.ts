// Section Types - Re-export from proto-generated types with UI helpers

export type {
  Section,
  CreateSectionRequest,
  CreateSectionResponse,
  GetSectionRequest,
  GetSectionResponse,
  UpdateSectionRequest,
  UpdateSectionResponse,
  DeleteSectionRequest,
  DeleteSectionResponse,
  ListSectionsRequest,
  ListSectionsResponse,
} from "@/types/generated/iam/v1/organization"

export {
  Section as SectionParser,
  CreateSectionResponse as CreateSectionResponseParser,
  GetSectionResponse as GetSectionResponseParser,
  UpdateSectionResponse as UpdateSectionResponseParser,
  DeleteSectionResponse as DeleteSectionResponseParser,
  ListSectionsResponse as ListSectionsResponseParser,
} from "@/types/generated/iam/v1/organization"

export {
  ActiveFilter,
} from "@/types/generated/iam/v1/user"

import { ActiveFilter } from "@/types/generated/iam/v1/user"

export interface ListSectionsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  departmentId?: string
  sortBy?: string
  sortOrder?: string
}

export interface SectionFormData {
  departmentId: string
  sectionCode: string
  sectionName: string
  description: string
  isActive: boolean
}

export const DEFAULT_SECTION_FORM_VALUES: SectionFormData = {
  departmentId: "",
  sectionCode: "",
  sectionName: "",
  description: "",
  isActive: true,
}
