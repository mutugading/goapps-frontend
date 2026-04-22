// RM Group Types - Re-export from proto-generated types with UI helpers

export type {
  RMGroupHead,
  RMGroupDetail,
  RMGroupHeadWithDetails,
  UngroupedItem,
  SkippedItem,
  CreateRMGroupRequest,
  CreateRMGroupResponse,
  GetRMGroupRequest,
  GetRMGroupResponse,
  UpdateRMGroupRequest,
  UpdateRMGroupResponse,
  DeleteRMGroupRequest,
  DeleteRMGroupResponse,
  ListRMGroupsRequest,
  ListRMGroupsResponse,
  AddItemsRequest,
  AddItemsResponse,
  RemoveItemsRequest,
  RemoveItemsResponse,
  ListUngroupedItemsRequest,
  ListUngroupedItemsResponse,
  RMGroupItemRates,
  GetRMGroupItemRatesRequest,
  GetRMGroupItemRatesResponse,
  ExportRMGroupsRequest,
  ExportRMGroupsResponse,
  ExportUngroupedItemsRequest,
  ExportUngroupedItemsResponse,
  ImportGroupItemsRequest,
  ImportGroupItemsResponse,
  DownloadGroupItemsTemplateRequest,
  DownloadGroupItemsTemplateResponse,
  ImportRMGroupsRequest,
  ImportRMGroupsResponse,
  DownloadRMGroupTemplateRequest,
  DownloadRMGroupTemplateResponse,
} from "@/types/generated/finance/v1/rm_group"

export {
  RMGroupHead as RMGroupHeadParser,
  RMGroupDetail as RMGroupDetailParser,
  RMGroupHeadWithDetails as RMGroupHeadWithDetailsParser,
  CreateRMGroupResponse as CreateRMGroupResponseParser,
  GetRMGroupResponse as GetRMGroupResponseParser,
  UpdateRMGroupResponse as UpdateRMGroupResponseParser,
  DeleteRMGroupResponse as DeleteRMGroupResponseParser,
  ListRMGroupsResponse as ListRMGroupsResponseParser,
  AddItemsResponse as AddItemsResponseParser,
  RemoveItemsResponse as RemoveItemsResponseParser,
  ListUngroupedItemsResponse as ListUngroupedItemsResponseParser,
  GetRMGroupItemRatesResponse as GetRMGroupItemRatesResponseParser,
  ExportRMGroupsResponse as ExportRMGroupsResponseParser,
  ExportUngroupedItemsResponse as ExportUngroupedItemsResponseParser,
  ImportGroupItemsResponse as ImportGroupItemsResponseParser,
  DownloadGroupItemsTemplateResponse as DownloadGroupItemsTemplateResponseParser,
  ImportRMGroupsResponse as ImportRMGroupsResponseParser,
  DownloadRMGroupTemplateResponse as DownloadRMGroupTemplateResponseParser,
  RMGroupFlag,
  rMGroupFlagFromJSON,
  rMGroupFlagToJSON,
} from "@/types/generated/finance/v1/rm_group"

export {
  ActiveFilter,
  activeFilterFromJSON,
  activeFilterToJSON,
} from "@/types/generated/finance/v1/uom"

export type {
  BaseResponse,
  PaginationResponse,
} from "@/types/generated/common/v1/common"

import { ActiveFilter } from "@/types/generated/finance/v1/uom"
import { RMGroupFlag } from "@/types/generated/finance/v1/rm_group"

// UI Labels for flags
export const RM_GROUP_FLAG_LABELS: Record<RMGroupFlag, string> = {
  [RMGroupFlag.RM_GROUP_FLAG_UNSPECIFIED]: "—",
  [RMGroupFlag.RM_GROUP_FLAG_INIT]: "INIT",
  [RMGroupFlag.RM_GROUP_FLAG_CONS]: "CONS",
  [RMGroupFlag.RM_GROUP_FLAG_STORES]: "STORES",
  [RMGroupFlag.RM_GROUP_FLAG_DEPT]: "DEPT",
  [RMGroupFlag.RM_GROUP_FLAG_PO_1]: "PO_1",
  [RMGroupFlag.RM_GROUP_FLAG_PO_2]: "PO_2",
  [RMGroupFlag.RM_GROUP_FLAG_PO_3]: "PO_3",
  [RMGroupFlag.UNRECOGNIZED]: "—",
}

export const RM_GROUP_FLAG_OPTIONS: Array<{ value: RMGroupFlag; label: string }> = [
  { value: RMGroupFlag.RM_GROUP_FLAG_CONS, label: "CONS" },
  { value: RMGroupFlag.RM_GROUP_FLAG_STORES, label: "STORES" },
  { value: RMGroupFlag.RM_GROUP_FLAG_DEPT, label: "DEPT" },
  { value: RMGroupFlag.RM_GROUP_FLAG_PO_1, label: "PO_1" },
  { value: RMGroupFlag.RM_GROUP_FLAG_PO_2, label: "PO_2" },
  { value: RMGroupFlag.RM_GROUP_FLAG_PO_3, label: "PO_3" },
  { value: RMGroupFlag.RM_GROUP_FLAG_INIT, label: "INIT" },
]

// Simplified list params
export interface ListRMGroupsParams {
  page?: number
  pageSize?: number
  search?: string
  activeFilter?: ActiveFilter
  sortBy?: string
  sortOrder?: string
}

export interface ListUngroupedItemsParams {
  period: string
  page?: number
  pageSize?: number
  search?: string
}

export interface ExportRMGroupsParams {
  activeFilter?: ActiveFilter
}

// Form data for group head create/edit
export interface RMGroupFormData {
  groupCode: string
  groupName: string
  description: string
  colourant: string
  ciName: string
  costPercentage: number
  costPerKg: number
  flagValuation: RMGroupFlag
  flagMarketing: RMGroupFlag
  flagSimulation: RMGroupFlag
  initValValuation: number | null
  initValMarketing: number | null
  initValSimulation: number | null
  isActive: boolean
}

export const DEFAULT_RM_GROUP_FORM_VALUES: RMGroupFormData = {
  groupCode: "",
  groupName: "",
  description: "",
  colourant: "",
  ciName: "",
  costPercentage: 0,
  costPerKg: 0,
  flagValuation: RMGroupFlag.RM_GROUP_FLAG_CONS,
  flagMarketing: RMGroupFlag.RM_GROUP_FLAG_CONS,
  flagSimulation: RMGroupFlag.RM_GROUP_FLAG_CONS,
  initValValuation: null,
  initValMarketing: null,
  initValSimulation: null,
  isActive: true,
}
