// RM Cost Types - Re-export from proto-generated types with UI helpers

export type {
  RMCost,
  RMCostRates,
  RMCostHistory,
  TriggerRMCostCalculationRequest,
  TriggerRMCostCalculationResponse,
  CalculateRMCostRequest,
  CalculateRMCostResponse,
  GetRMCostRequest,
  GetRMCostResponse,
  ListRMCostsRequest,
  ListRMCostsResponse,
  ListRMCostHistoryRequest,
  ListRMCostHistoryResponse,
  ListRMCostPeriodsRequest,
  ListRMCostPeriodsResponse,
  ExportRMCostsRequest,
  ExportRMCostsResponse,
} from "@/types/generated/finance/v1/rm_cost"

export {
  RMCost as RMCostParser,
  RMCostHistory as RMCostHistoryParser,
  TriggerRMCostCalculationResponse as TriggerRMCostCalculationResponseParser,
  CalculateRMCostResponse as CalculateRMCostResponseParser,
  GetRMCostResponse as GetRMCostResponseParser,
  ListRMCostsResponse as ListRMCostsResponseParser,
  ListRMCostHistoryResponse as ListRMCostHistoryResponseParser,
  ListRMCostPeriodsResponse as ListRMCostPeriodsResponseParser,
  ExportRMCostsResponse as ExportRMCostsResponseParser,
  RMCostType,
  rMCostTypeFromJSON,
  rMCostTypeToJSON,
  RMCostTriggerReason,
  rMCostTriggerReasonFromJSON,
  rMCostTriggerReasonToJSON,
} from "@/types/generated/finance/v1/rm_cost"

export type {
  BaseResponse,
  PaginationResponse,
} from "@/types/generated/common/v1/common"

import { RMCostType, RMCostTriggerReason } from "@/types/generated/finance/v1/rm_cost"

export const RM_COST_TYPE_LABELS: Record<RMCostType, string> = {
  [RMCostType.RM_COST_TYPE_UNSPECIFIED]: "—",
  [RMCostType.RM_COST_TYPE_GROUP]: "Group",
  [RMCostType.RM_COST_TYPE_ITEM]: "Item",
  [RMCostType.UNRECOGNIZED]: "—",
}

export const RM_COST_TRIGGER_REASON_LABELS: Record<RMCostTriggerReason, string> = {
  [RMCostTriggerReason.RM_COST_TRIGGER_REASON_UNSPECIFIED]: "—",
  [RMCostTriggerReason.RM_COST_TRIGGER_REASON_ORACLE_SYNC_CHAIN]: "Oracle sync",
  [RMCostTriggerReason.RM_COST_TRIGGER_REASON_GROUP_UPDATE]: "Group update",
  [RMCostTriggerReason.RM_COST_TRIGGER_REASON_DETAIL_CHANGE]: "Detail change",
  [RMCostTriggerReason.RM_COST_TRIGGER_REASON_MANUAL_UI]: "Manual",
  [RMCostTriggerReason.UNRECOGNIZED]: "—",
}

export interface ListRMCostsParams {
  page?: number
  pageSize?: number
  period?: string
  rmType?: RMCostType
  groupHeadId?: string
  search?: string
  sortBy?: string
  sortOrder?: string
}

export interface ListRMCostHistoryParams {
  page?: number
  pageSize?: number
  period?: string
  rmCode?: string
  groupHeadId?: string
  jobId?: string
}

export interface TriggerRMCostParams {
  period: string
  groupHeadId?: string
  triggerReason: RMCostTriggerReason
}
