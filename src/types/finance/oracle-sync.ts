// Oracle Sync Types - Re-export from proto-generated types with UI helpers

// ============================================================================
// Re-export proto-generated types
// ============================================================================

// Enums
export {
  JobStatus,
  jobStatusFromJSON,
  jobStatusToJSON,
  JobLogStatus,
  jobLogStatusFromJSON,
  jobLogStatusToJSON,
} from "@/types/generated/finance/v1/oracle_sync"

// Entity and Request/Response types (as type-only exports)
export type {
  SyncJob,
  SyncJobLog,
  ItemConsStockPO,
  TriggerSyncRequest,
  TriggerSyncResponse,
  GetSyncJobRequest,
  GetSyncJobResponse,
  ListSyncJobsRequest,
  ListSyncJobsResponse,
  CancelSyncJobRequest,
  CancelSyncJobResponse,
  ListItemConsStockPORequest,
  ListItemConsStockPOResponse,
  ListSyncPeriodsRequest,
  ListSyncPeriodsResponse,
} from "@/types/generated/finance/v1/oracle_sync"

// Message functions for parsing (named exports as Parsers)
export {
  SyncJob as SyncJobParser,
  SyncJobLog as SyncJobLogParser,
  ItemConsStockPO as ItemConsStockPOParser,
  TriggerSyncRequest as TriggerSyncRequestParser,
  TriggerSyncResponse as TriggerSyncResponseParser,
  GetSyncJobRequest as GetSyncJobRequestParser,
  GetSyncJobResponse as GetSyncJobResponseParser,
  ListSyncJobsRequest as ListSyncJobsRequestParser,
  ListSyncJobsResponse as ListSyncJobsResponseParser,
  CancelSyncJobRequest as CancelSyncJobRequestParser,
  CancelSyncJobResponse as CancelSyncJobResponseParser,
  ListItemConsStockPORequest as ListItemConsStockPORequestParser,
  ListItemConsStockPOResponse as ListItemConsStockPOResponseParser,
  ListSyncPeriodsRequest as ListSyncPeriodsRequestParser,
  ListSyncPeriodsResponse as ListSyncPeriodsResponseParser,
} from "@/types/generated/finance/v1/oracle_sync"

// Re-export common types from proto
export type {
  BaseResponse,
  PaginationResponse,
} from "@/types/generated/common/v1/common"

// ============================================================================
// Import for local use
// ============================================================================

import { JobStatus, JobLogStatus } from "@/types/generated/finance/v1/oracle_sync"

// ============================================================================
// UI Display Labels
// ============================================================================

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  [JobStatus.JOB_STATUS_UNSPECIFIED]: "Unknown",
  [JobStatus.JOB_STATUS_QUEUED]: "Queued",
  [JobStatus.JOB_STATUS_PROCESSING]: "Processing",
  [JobStatus.JOB_STATUS_SUCCESS]: "Success",
  [JobStatus.JOB_STATUS_FAILED]: "Failed",
  [JobStatus.JOB_STATUS_CANCELLED]: "Cancelled",
  [JobStatus.UNRECOGNIZED]: "Unknown",
}

export const JOB_STATUS_VARIANTS: Record<JobStatus, "default" | "secondary" | "destructive" | "outline"> = {
  [JobStatus.JOB_STATUS_UNSPECIFIED]: "outline",
  [JobStatus.JOB_STATUS_QUEUED]: "secondary",
  [JobStatus.JOB_STATUS_PROCESSING]: "default",
  [JobStatus.JOB_STATUS_SUCCESS]: "default",
  [JobStatus.JOB_STATUS_FAILED]: "destructive",
  [JobStatus.JOB_STATUS_CANCELLED]: "outline",
  [JobStatus.UNRECOGNIZED]: "outline",
}

export const JOB_LOG_STATUS_LABELS: Record<JobLogStatus, string> = {
  [JobLogStatus.JOB_LOG_STATUS_UNSPECIFIED]: "Unknown",
  [JobLogStatus.JOB_LOG_STATUS_STARTED]: "Started",
  [JobLogStatus.JOB_LOG_STATUS_SUCCESS]: "Success",
  [JobLogStatus.JOB_LOG_STATUS_FAILED]: "Failed",
  [JobLogStatus.JOB_LOG_STATUS_SKIPPED]: "Skipped",
  [JobLogStatus.UNRECOGNIZED]: "Unknown",
}

export const JOB_STATUS_FILTER_OPTIONS = [
  { value: JobStatus.JOB_STATUS_UNSPECIFIED, label: "All Status" },
  { value: JobStatus.JOB_STATUS_QUEUED, label: "Queued" },
  { value: JobStatus.JOB_STATUS_PROCESSING, label: "Processing" },
  { value: JobStatus.JOB_STATUS_SUCCESS, label: "Success" },
  { value: JobStatus.JOB_STATUS_FAILED, label: "Failed" },
  { value: JobStatus.JOB_STATUS_CANCELLED, label: "Cancelled" },
]

// ============================================================================
// Simplified Params Types for Hooks
// ============================================================================

export interface ListSyncJobsParams {
  page?: number
  pageSize?: number
  jobType?: string
  status?: JobStatus
  period?: string
  search?: string
}

export interface ListItemConsStockPOParams {
  page?: number
  pageSize?: number
  period?: string
  itemCode?: string
  search?: string
}

// ============================================================================
// Helper Functions
// ============================================================================

export function formatPeriod(period: string): string {
  if (!period || period.length !== 6) return period || "-"
  const year = period.substring(0, 4)
  const month = period.substring(4, 6)
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]
  const monthIndex = parseInt(month, 10) - 1
  if (monthIndex < 0 || monthIndex > 11) return period
  return `${monthNames[monthIndex]} ${year}`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

export function isJobActive(status: JobStatus): boolean {
  return status === JobStatus.JOB_STATUS_QUEUED || status === JobStatus.JOB_STATUS_PROCESSING
}
