// CMS Page Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

export type {
  CMSPage,
  CreateCMSPageRequest,
  CreateCMSPageResponse,
  GetCMSPageRequest,
  GetCMSPageResponse,
  GetCMSPageBySlugRequest,
  GetCMSPageBySlugResponse,
  UpdateCMSPageRequest,
  UpdateCMSPageResponse,
  DeleteCMSPageRequest,
  DeleteCMSPageResponse,
  ListCMSPagesRequest,
  ListCMSPagesResponse,
} from "@/types/generated/iam/v1/cms"

export {
  CMSPage as CMSPageParser,
  CreateCMSPageResponse as CreateCMSPageResponseParser,
  GetCMSPageResponse as GetCMSPageResponseParser,
  GetCMSPageBySlugResponse as GetCMSPageBySlugResponseParser,
  UpdateCMSPageResponse as UpdateCMSPageResponseParser,
  DeleteCMSPageResponse as DeleteCMSPageResponseParser,
  ListCMSPagesResponse as ListCMSPagesResponseParser,
} from "@/types/generated/iam/v1/cms"

export type {
  BaseResponse,
  PaginationResponse,
} from "@/types/generated/common/v1/common"

// ============================================================================
// Simplified Params Types for Hooks
// ============================================================================

export interface ListCMSPagesParams {
  page?: number
  pageSize?: number
  search?: string
  isPublished?: boolean | null
  sortBy?: string
  sortOrder?: string
}

// ============================================================================
// UI Display Labels
// ============================================================================

export const PUBLISH_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
]

// ============================================================================
// Form Types
// ============================================================================

export interface CMSPageFormData {
  pageSlug: string
  pageTitle: string
  pageContent: string
  metaDescription: string
  isPublished: boolean
  sortOrder: number
}

export const DEFAULT_CMS_PAGE_FORM_VALUES: CMSPageFormData = {
  pageSlug: "",
  pageTitle: "",
  pageContent: "",
  metaDescription: "",
  isPublished: false,
  sortOrder: 0,
}
