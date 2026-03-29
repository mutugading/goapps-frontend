// CMS Section Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

export type {
  CMSSection,
  CreateCMSSectionRequest,
  CreateCMSSectionResponse,
  GetCMSSectionRequest,
  GetCMSSectionResponse,
  UpdateCMSSectionRequest,
  UpdateCMSSectionResponse,
  DeleteCMSSectionRequest,
  DeleteCMSSectionResponse,
  ListCMSSectionsRequest,
  ListCMSSectionsResponse,
  GetPublicLandingContentRequest,
  GetPublicLandingContentResponse,
} from "@/types/generated/iam/v1/cms"

export {
  CMSSection as CMSSectionParser,
  CreateCMSSectionResponse as CreateCMSSectionResponseParser,
  GetCMSSectionResponse as GetCMSSectionResponseParser,
  UpdateCMSSectionResponse as UpdateCMSSectionResponseParser,
  DeleteCMSSectionResponse as DeleteCMSSectionResponseParser,
  ListCMSSectionsResponse as ListCMSSectionsResponseParser,
  GetPublicLandingContentResponse as GetPublicLandingContentResponseParser,
} from "@/types/generated/iam/v1/cms"

export {
  CMSSectionType,
  cMSSectionTypeFromJSON,
  cMSSectionTypeToJSON,
} from "@/types/generated/iam/v1/cms"

export type {
  BaseResponse,
  PaginationResponse,
} from "@/types/generated/common/v1/common"

// ============================================================================
// Import for local use
// ============================================================================

import { CMSSectionType } from "@/types/generated/iam/v1/cms"

// ============================================================================
// UI Display Labels
// ============================================================================

export const SECTION_TYPE_LABELS: Record<CMSSectionType, string> = {
  [CMSSectionType.CMS_SECTION_TYPE_UNSPECIFIED]: "All Types",
  [CMSSectionType.CMS_SECTION_TYPE_HERO]: "Hero",
  [CMSSectionType.CMS_SECTION_TYPE_FEATURE]: "Feature",
  [CMSSectionType.CMS_SECTION_TYPE_FAQ]: "FAQ",
  [CMSSectionType.CMS_SECTION_TYPE_TESTIMONIAL]: "Testimonial",
  [CMSSectionType.CMS_SECTION_TYPE_CTA]: "CTA",
  [CMSSectionType.CMS_SECTION_TYPE_CUSTOM]: "Custom",
  [CMSSectionType.UNRECOGNIZED]: "Unknown",
}

export const SECTION_TYPE_OPTIONS = [
  { value: CMSSectionType.CMS_SECTION_TYPE_UNSPECIFIED, label: "All Types" },
  { value: CMSSectionType.CMS_SECTION_TYPE_HERO, label: "Hero" },
  { value: CMSSectionType.CMS_SECTION_TYPE_FEATURE, label: "Feature" },
  { value: CMSSectionType.CMS_SECTION_TYPE_FAQ, label: "FAQ" },
  { value: CMSSectionType.CMS_SECTION_TYPE_TESTIMONIAL, label: "Testimonial" },
  { value: CMSSectionType.CMS_SECTION_TYPE_CTA, label: "CTA" },
  { value: CMSSectionType.CMS_SECTION_TYPE_CUSTOM, label: "Custom" },
]

export const PUBLISH_STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "true", label: "Published" },
  { value: "false", label: "Draft" },
]

// ============================================================================
// Simplified Params Types for Hooks
// ============================================================================

export interface ListCMSSectionsParams {
  page?: number
  pageSize?: number
  search?: string
  sectionType?: CMSSectionType
  isPublished?: boolean | null
  sortBy?: string
  sortOrder?: string
}

// ============================================================================
// Form Types
// ============================================================================

export interface CMSSectionFormData {
  sectionType: CMSSectionType
  sectionKey: string
  title: string
  subtitle: string
  content: string
  iconName: string
  imageUrl: string
  buttonText: string
  buttonUrl: string
  sortOrder: number
  isPublished: boolean
  metadata: string
}

export const DEFAULT_CMS_SECTION_FORM_VALUES: CMSSectionFormData = {
  sectionType: CMSSectionType.CMS_SECTION_TYPE_CUSTOM,
  sectionKey: "",
  title: "",
  subtitle: "",
  content: "",
  iconName: "",
  imageUrl: "",
  buttonText: "",
  buttonUrl: "",
  sortOrder: 0,
  isPublished: false,
  metadata: "{}",
}
