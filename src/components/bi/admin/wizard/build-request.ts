// Converts the wizard's DashboardFormData into the proto request shapes expected by
// the BFF/gRPC layer. Centralised so create + update + preview stay consistent.

import {
  ChartType,
  PeriodeGrain,
  CompareMode,
  type CreateDashboardRequest,
  type UpdateDashboardRequest,
  type PreviewDashboardRequest,
  type DashboardFormData,
  type KpiEntry,
} from "@/types/bi"

/** kpi_config travels as a Struct wrapping an "items" array (matches backend structListToMaps). */
function kpiConfigStruct(kpis: KpiEntry[]): Record<string, unknown> {
  return {
    items: kpis.map((k) => ({
      label: k.label,
      value_field: k.valueField,
      agg: k.agg,
      compare: k.compare,
      format: k.format,
      ...(k.decimals !== undefined ? { decimals: k.decimals } : {}),
      ...(k.showSparkline ? { show_sparkline: true } : {}),
      ...(k.sparklinePeriods ? { sparkline_periods: k.sparklinePeriods } : {}),
    })),
  }
}

/** Convert the FE period preset string to the default_period field (same string keys). */
function defaultPeriodString(form: DashboardFormData): string {
  return form.defaultPeriod
}

/** Build a CreateDashboardRequest from wizard form data. */
export function buildCreateRequest(form: DashboardFormData): CreateDashboardRequest {
  return {
    dashboardCode: form.dashboardCode,
    dashboardTitle: form.dashboardTitle,
    description: form.description,
    filterType: form.filterType,
    filterGroup1: form.filterGroup1,
    periodeGrain: form.periodeGrain,
    defaultPeriod: defaultPeriodString(form),
    chartType: form.chartType,
    chartConfig: form.chartConfig,
    layoutConfig: form.layoutConfig ?? undefined,
    compareModes: form.compareModes,
    kpiConfig: kpiConfigStruct(form.kpiConfig),
    drillEnabled: form.drillEnabled,
    maxDrillLevel: form.maxDrillLevel,
    cacheTtlSec: form.cacheTtlSec,
    refreshIntervalSec: form.refreshIntervalSec,
    displayOrder: form.displayOrder,
    groupId: form.groupId,
    allowedRoleCodes: form.allowedRoleCodes,
    isActive: form.isActive,
  } as CreateDashboardRequest
}

/** Build an UpdateDashboardRequest (full replace; the wizard always sends all fields). */
export function buildUpdateRequest(form: DashboardFormData): Omit<UpdateDashboardRequest, "dashboardId"> {
  return {
    dashboardTitle: form.dashboardTitle,
    description: form.description,
    filterType: form.filterType,
    filterGroup1: form.filterGroup1,
    periodeGrain: form.periodeGrain,
    defaultPeriod: defaultPeriodString(form),
    chartType: form.chartType,
    chartConfig: form.chartConfig,
    layoutConfig: form.layoutConfig ?? undefined,
    compareModes: form.compareModes,
    kpiConfig: kpiConfigStruct(form.kpiConfig),
    drillEnabled: form.drillEnabled,
    maxDrillLevel: form.maxDrillLevel,
    cacheTtlSec: form.cacheTtlSec,
    refreshIntervalSec: form.refreshIntervalSec,
    displayOrder: form.displayOrder,
    groupId: form.groupId,
    isActive: form.isActive,
  } as Omit<UpdateDashboardRequest, "dashboardId">
}

/** Build a PreviewDashboardRequest from the in-progress form. */
export function buildPreviewRequest(form: DashboardFormData): PreviewDashboardRequest {
  return {
    filterType: form.filterType,
    filterGroup1: form.filterGroup1,
    periodeGrain: form.periodeGrain,
    chartType: form.chartType,
    chartConfig: form.chartConfig,
    kpiConfig: kpiConfigStruct(form.kpiConfig),
    compareModes: form.compareModes,
  } as PreviewDashboardRequest
}

/** Empty form defaults for the "create" wizard. */
export function emptyForm(): DashboardFormData {
  return {
    dashboardCode: "",
    dashboardTitle: "",
    description: "",
    filterType: "",
    filterGroup1: "",
    periodeGrain: PeriodeGrain.PERIODE_GRAIN_MONTHLY,
    defaultPeriod: "L12M",
    chartType: ChartType.CHART_TYPE_BAR,
    chartConfig: {},
    layoutConfig: null,
    kpiConfig: [],
    compareModes: [],
    drillEnabled: true,
    maxDrillLevel: 3,
    cacheTtlSec: 1800,
    refreshIntervalSec: 0,
    displayOrder: 0,
    groupId: "",
    isActive: true,
    allowedRoleCodes: [],
  }
}

/** Whether the required fields for the current step are satisfied (used to gate "Next"). */
export function isStepValid(step: number, form: DashboardFormData, requiredFields: string[]): boolean {
  switch (step) {
    case 0: // Basic
      return /^[A-Z][A-Z0-9_]*$/.test(form.dashboardCode) && form.dashboardTitle.trim().length > 0 && form.groupId !== ""
    case 1: // Data binding
      return form.filterType !== ""
    case 2: // Chart type
      return form.chartType !== ChartType.CHART_TYPE_UNSPECIFIED
    case 3: // Field mapping — every required field must be set in chart_config
      return requiredFields.every((f) => {
        const v = form.chartConfig[f]
        return typeof v === "string" ? v.length > 0 : v !== undefined && v !== null
      })
    default:
      return true
  }
}

export { CompareMode }
