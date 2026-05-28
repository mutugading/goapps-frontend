// BI types - re-export proto-generated types + UI helpers + form helpers.
//
// Proto types are imported from the generated bi.ts. This file establishes a single
// barrel so feature code does `import { Dashboard, useDashboards } from "@/types/bi"`
// without needing to know whether a type came from generated proto or a typed helper.

// ============================================================================
// Re-export proto enums (runtime values + helpers)
// ============================================================================

export {
  PeriodeGrain,
  CompareMode,
  ChartType,
  DataSourceType,
  periodeGrainFromJSON,
  periodeGrainToJSON,
  compareModeFromJSON,
  compareModeToJSON,
  chartTypeFromJSON,
  chartTypeToJSON,
  dataSourceTypeFromJSON,
  dataSourceTypeToJSON,
} from "@/types/generated/finance/v1/bi"

// ============================================================================
// Re-export proto entity + request/response interfaces
// ============================================================================

export type {
  Dashboard,
  DashboardGroup,
  DataSource,
  FactMetricDistinct,
  ChartDataResponse,
  Series,
  DataPoint,
  KpiResult,
  DrillContext,
  Meta,
  ViewerFilters,
  BiJob,
  BiJobLog,
  // Requests/Responses
  CreateDashboardRequest,
  CreateDashboardResponse,
  GetDashboardRequest,
  GetDashboardResponse,
  GetDashboardByCodeRequest,
  GetDashboardByCodeResponse,
  ListDashboardsRequest,
  ListDashboardsResponse,
  UpdateDashboardRequest,
  UpdateDashboardResponse,
  DeleteDashboardRequest,
  DeleteDashboardResponse,
  DuplicateDashboardRequest,
  DuplicateDashboardResponse,
  SetDashboardRolesRequest,
  SetDashboardRolesResponse,
  ListAccessibleDashboardsRequest,
  ListAccessibleDashboardsResponse,
  CreateDashboardGroupRequest,
  CreateDashboardGroupResponse,
  ListDashboardGroupsRequest,
  ListDashboardGroupsResponse,
  UpdateDashboardGroupRequest,
  UpdateDashboardGroupResponse,
  DeleteDashboardGroupRequest,
  DeleteDashboardGroupResponse,
  GetDashboardDataRequest,
  GetDashboardDataResponse,
  PreviewDashboardRequest,
  PreviewDashboardResponse,
  ListDataSourcesRequest,
  ListDataSourcesResponse,
  GetFactDistinctsRequest,
  GetFactDistinctsResponse,
  ListJobsRequest,
  ListJobsResponse,
  ListJobLogsRequest,
  ListJobLogsResponse,
  TriggerJobRequest,
  TriggerJobResponse,
} from "@/types/generated/finance/v1/bi"

// Re-export proto Parsers for response decoding.
export {
  Dashboard as DashboardParser,
  DashboardGroup as DashboardGroupParser,
  DataSource as DataSourceParser,
  FactMetricDistinct as FactMetricDistinctParser,
  ChartDataResponse as ChartDataResponseParser,
  CreateDashboardResponse as CreateDashboardResponseParser,
  GetDashboardResponse as GetDashboardResponseParser,
  GetDashboardByCodeResponse as GetDashboardByCodeResponseParser,
  ListDashboardsResponse as ListDashboardsResponseParser,
  UpdateDashboardResponse as UpdateDashboardResponseParser,
  DeleteDashboardResponse as DeleteDashboardResponseParser,
  DuplicateDashboardResponse as DuplicateDashboardResponseParser,
  SetDashboardRolesResponse as SetDashboardRolesResponseParser,
  ListAccessibleDashboardsResponse as ListAccessibleDashboardsResponseParser,
  CreateDashboardGroupResponse as CreateDashboardGroupResponseParser,
  ListDashboardGroupsResponse as ListDashboardGroupsResponseParser,
  UpdateDashboardGroupResponse as UpdateDashboardGroupResponseParser,
  DeleteDashboardGroupResponse as DeleteDashboardGroupResponseParser,
  GetDashboardDataResponse as GetDashboardDataResponseParser,
  PreviewDashboardResponse as PreviewDashboardResponseParser,
  ListDataSourcesResponse as ListDataSourcesResponseParser,
  GetFactDistinctsResponse as GetFactDistinctsResponseParser,
  ListJobsResponse as ListJobsResponseParser,
  ListJobLogsResponse as ListJobLogsResponseParser,
  TriggerJobResponse as TriggerJobResponseParser,
} from "@/types/generated/finance/v1/bi"

// ============================================================================
// Local UI types
// ============================================================================

import type {
  Dashboard,
  CompareMode,
  PeriodeGrain,
  ChartType,
} from "@/types/generated/finance/v1/bi"

/** Period preset enum (canonical string keys matching backend ResolvePeriod). */
export type PeriodPreset = "L12M" | "L24M" | "THIS_YEAR" | "THIS_QTR" | "THIS_MONTH" | "ALL" | "CUSTOM"
export const PERIOD_PRESETS: PeriodPreset[] = ["L12M", "L24M", "THIS_YEAR", "THIS_QTR", "THIS_MONTH", "ALL", "CUSTOM"]
export const PERIOD_PRESET_LABELS: Record<PeriodPreset, string> = {
  L12M: "Last 12 Months",
  L24M: "Last 24 Months",
  THIS_YEAR: "This Year",
  THIS_QTR: "This Quarter",
  THIS_MONTH: "This Month",
  ALL: "All Periods",
  CUSTOM: "Custom Range",
}

/** Compare-mode string keys (matches CompareMode enum). */
export type CompareKey = "NONE" | "MoM" | "QoQ" | "YoY" | "YTD" | "R12"
export const COMPARE_KEYS: CompareKey[] = ["NONE", "MoM", "QoQ", "YoY", "YTD", "R12"]
export const COMPARE_LABELS: Record<CompareKey, string> = {
  NONE: "None",
  MoM: "MoM",
  QoQ: "QoQ",
  YoY: "YoY",
  YTD: "YTD",
  R12: "R12",
}

/** Viewer state synced to URL via useUrlState. */
export interface ViewerState {
  period: PeriodPreset
  periodFrom?: string // ISO date for CUSTOM
  periodTo?: string
  compare: CompareKey
  drillPath: string[]
  /** Active chart type override selected by the viewer. Empty string = use dashboard primary. */
  chartType?: string
  /** Selected group_1 values from filter chips (Delivery Type). Empty = show all. */
  group1Filter: string[]
  /** Selected group_2 values from filter chips (Category). Empty = show all. */
  group2Filter: string[]
  /**
   * Selected period (YYYYMM) for waterfall/bar breakdown and secondary data_table filtering.
   * Defaults to the latest available period in the loaded chart data.
   * Hidden when the active chart type is a trend type (line/area/multi_line).
   */
  selectedPeriod?: string
}

export const DEFAULT_VIEWER_STATE: ViewerState = {
  period: "L12M",
  compare: "NONE",
  drillPath: [],
  chartType: "",
  group1Filter: [],
  group2Filter: [],
  selectedPeriod: undefined,
}

/** Simplified list params for hooks. */
export interface ListDashboardsParams {
  page?: number
  pageSize?: number
  search?: string
  groupId?: string
  filterType?: string
  includeInactive?: boolean
  sortBy?: string
  sortOrder?: string
}

/** Helper to derive a chart_type's human label. */
export const CHART_TYPE_LABELS: Record<string, string> = {
  bar: "Bar Chart",
  horizontal_bar: "Horizontal Bar",
  stacked_bar: "Stacked Bar",
  line: "Line",
  area: "Area",
  waterfall: "Waterfall",
  donut: "Donut",
  kpi_card: "KPI Card",
  treemap: "Treemap",
  heatmap: "Heatmap",
  scatter: "Scatter",
  mixed: "Mixed (Bar + Line)",
  data_table: "Data Table",
}

/** Default values for the admin wizard's Dashboard form. */
export interface DashboardFormData {
  dashboardCode: string
  dashboardTitle: string
  description: string
  filterType: string
  filterGroup1: string
  periodeGrain: PeriodeGrain
  defaultPeriod: PeriodPreset
  chartType: ChartType
  chartConfig: Record<string, unknown>
  layoutConfig: Record<string, unknown> | null
  kpiConfig: KpiEntry[]
  compareModes: CompareMode[]
  drillEnabled: boolean
  maxDrillLevel: number
  cacheTtlSec: number
  refreshIntervalSec: number
  displayOrder: number
  groupId: string
  isActive: boolean
  allowedRoleCodes: string[]
}

/** KPI entry shape used by the admin form (typed mirror of backend KpiEntry). */
export interface KpiEntry {
  label: string
  valueField: string
  agg: "sum" | "avg" | "min" | "max" | "last"
  compare: "MoM" | "QoQ" | "YoY" | "YTD_vs_LY" | "none"
  format: string
  decimals?: number
  showSparkline?: boolean
  sparklinePeriods?: number
}

/** Helper: derive the canonical chart_type string from the proto enum. */
export function chartTypeToString(t: ChartType): string {
  switch (t) {
    case 1: return "bar"
    case 2: return "horizontal_bar"
    case 3: return "stacked_bar"
    case 4: return "line"
    case 5: return "area"
    case 6: return "waterfall"
    case 7: return "donut"
    case 8: return "kpi_card"
    case 9: return "treemap"
    case 10: return "heatmap"
    case 11: return "scatter"
    case 12: return "mixed"
    case 13: return "data_table"
    default: return ""
  }
}

/** Helper: derive period-grain string. */
export function periodeGrainToString(g: PeriodeGrain): string {
  switch (g) {
    case 1: return "DAILY"
    case 2: return "MONTHLY"
    case 3: return "QUARTERLY"
    case 4: return "YEARLY"
    default: return ""
  }
}

/** Helper: convert a Dashboard's allowed_role_codes to a Set for membership checks. */
export function rolesToSet(d: Dashboard): Set<string> {
  return new Set(d.allowedRoleCodes ?? [])
}

// ============================================================================
// Excel upload types
// ============================================================================

export { normalizeUpload } from "./upload"
export type {
  NormalizedUpload,
  NormalizedUploadError,
  UploadStatus,
} from "./upload"

// ============================================================================
// Config-change audit types
// ============================================================================

export { normalizeAuditEntry } from "./audit"
export type {
  RawAuditEntry,
  NormalizedAuditEntry,
  AuditEntityType,
  AuditAction,
} from "./audit"
