// CMS Setting Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

export type {
  CMSSetting,
  GetCMSSettingRequest,
  GetCMSSettingResponse,
  UpdateCMSSettingRequest,
  UpdateCMSSettingResponse,
  ListCMSSettingsRequest,
  ListCMSSettingsResponse,
  BulkUpdateCMSSettingsRequest,
  BulkUpdateCMSSettingsResponse,
  CMSSettingUpdate,
} from "@/types/generated/iam/v1/cms"

export {
  GetCMSSettingResponse as GetCMSSettingResponseParser,
  UpdateCMSSettingResponse as UpdateCMSSettingResponseParser,
  ListCMSSettingsResponse as ListCMSSettingsResponseParser,
  BulkUpdateCMSSettingsResponse as BulkUpdateCMSSettingsResponseParser,
} from "@/types/generated/iam/v1/cms"

export {
  CMSSettingType,
  cMSSettingTypeFromJSON,
  cMSSettingTypeToJSON,
} from "@/types/generated/iam/v1/cms"

// ============================================================================
// Import for local use
// ============================================================================

import { CMSSettingType } from "@/types/generated/iam/v1/cms"

// ============================================================================
// UI Display Labels
// ============================================================================

export const SETTING_TYPE_LABELS: Record<CMSSettingType, string> = {
  [CMSSettingType.CMS_SETTING_TYPE_UNSPECIFIED]: "Unknown",
  [CMSSettingType.CMS_SETTING_TYPE_TEXT]: "Text",
  [CMSSettingType.CMS_SETTING_TYPE_RICH_TEXT]: "Rich Text",
  [CMSSettingType.CMS_SETTING_TYPE_IMAGE]: "Image URL",
  [CMSSettingType.CMS_SETTING_TYPE_URL]: "URL",
  [CMSSettingType.CMS_SETTING_TYPE_JSON]: "JSON",
  [CMSSettingType.UNRECOGNIZED]: "Unknown",
}

export const SETTING_GROUP_LABELS: Record<string, string> = {
  general: "General",
  branding: "Branding",
  social: "Social Media",
  footer: "Footer",
}
