// cost_product_parameter (CPP_) — per-product parameter values.
// Handles both camelCase and snake_case from BFF.

export type ParamDataType = "NUMBER" | "TEXT" | "BOOLEAN"

export interface RequiredParamEntry {
  paramId: string
  paramCode: string
  paramName: string
  paramShortName: string
  dataType: ParamDataType
  paramCategory: string
  uomCode: string
  ownerDepartment: string
  isRequiredForCosting: boolean
  lookupMasterCode: string
  displayOrder: number
  displayGroup: string
  hasValue: boolean
  valueNumeric: string
  valueText: string
  valueFlag: boolean
  filledAt: string
  filledBy: string
}

export interface MissingParam {
  paramId: string
  paramCode: string
  paramName: string
  displayGroup: string
}

interface RawRequiredParamEntry {
  paramId?: string
  param_id?: string
  paramCode?: string
  param_code?: string
  paramName?: string
  param_name?: string
  paramShortName?: string
  param_short_name?: string
  dataType?: string
  data_type?: string
  paramCategory?: string
  param_category?: string
  uomCode?: string
  uom_code?: string
  ownerDepartment?: string
  owner_department?: string
  isRequiredForCosting?: boolean
  is_required_for_costing?: boolean
  lookupMasterCode?: string
  lookup_master_code?: string
  displayOrder?: number
  display_order?: number
  displayGroup?: string
  display_group?: string
  hasValue?: boolean
  has_value?: boolean
  valueNumeric?: string
  value_numeric?: string
  valueText?: string
  value_text?: string
  valueFlag?: boolean
  value_flag?: boolean
  filledAt?: string
  filled_at?: string
  filledBy?: string
  filled_by?: string
}

export function normalizeRequiredEntry(raw: RawRequiredParamEntry): RequiredParamEntry {
  return {
    paramId: raw.paramId ?? raw.param_id ?? "",
    paramCode: raw.paramCode ?? raw.param_code ?? "",
    paramName: raw.paramName ?? raw.param_name ?? "",
    paramShortName: raw.paramShortName ?? raw.param_short_name ?? "",
    dataType: (raw.dataType ?? raw.data_type ?? "TEXT") as ParamDataType,
    paramCategory: raw.paramCategory ?? raw.param_category ?? "",
    uomCode: raw.uomCode ?? raw.uom_code ?? "",
    ownerDepartment: raw.ownerDepartment ?? raw.owner_department ?? "",
    isRequiredForCosting: raw.isRequiredForCosting ?? raw.is_required_for_costing ?? false,
    lookupMasterCode: raw.lookupMasterCode ?? raw.lookup_master_code ?? "",
    displayOrder: Number(raw.displayOrder ?? raw.display_order ?? 0),
    displayGroup: raw.displayGroup ?? raw.display_group ?? "",
    hasValue: raw.hasValue ?? raw.has_value ?? false,
    valueNumeric: raw.valueNumeric ?? raw.value_numeric ?? "",
    valueText: raw.valueText ?? raw.value_text ?? "",
    valueFlag: raw.valueFlag ?? raw.value_flag ?? false,
    filledAt: raw.filledAt ?? raw.filled_at ?? "",
    filledBy: raw.filledBy ?? raw.filled_by ?? "",
  }
}

export function normalizeMissingParam(raw: Partial<MissingParam> & Record<string, unknown>): MissingParam {
  return {
    paramId: (raw.paramId as string) ?? (raw.param_id as string) ?? "",
    paramCode: (raw.paramCode as string) ?? (raw.param_code as string) ?? "",
    paramName: (raw.paramName as string) ?? (raw.param_name as string) ?? "",
    displayGroup: (raw.displayGroup as string) ?? (raw.display_group as string) ?? "",
  }
}

export interface UpsertParamValuePayload {
  productSysId: number
  paramId: string
  valueNumeric?: string
  valueText?: string
  valueFlag?: boolean
  hasValueFlag?: boolean
}

// AvailableParamEntry — params NOT yet applicable for a product (Add Parameter picker).
export interface AvailableParamEntry {
  paramId: string
  paramCode: string
  paramName: string
  paramShortName: string
  dataType: ParamDataType
  paramCategory: string
  uomCode: string
  ownerDepartment: string
  isRequiredForCosting: boolean
  lookupMasterCode: string
  displayOrder: number
  displayGroup: string
}

export function normalizeAvailable(raw: Record<string, unknown>): AvailableParamEntry {
  const r = raw as Record<string, unknown>
  return {
    paramId: (r.paramId as string) ?? (r.param_id as string) ?? "",
    paramCode: (r.paramCode as string) ?? (r.param_code as string) ?? "",
    paramName: (r.paramName as string) ?? (r.param_name as string) ?? "",
    paramShortName: (r.paramShortName as string) ?? (r.param_short_name as string) ?? "",
    dataType: ((r.dataType as string) ?? (r.data_type as string) ?? "TEXT") as ParamDataType,
    paramCategory: (r.paramCategory as string) ?? (r.param_category as string) ?? "",
    uomCode: (r.uomCode as string) ?? (r.uom_code as string) ?? "",
    ownerDepartment: (r.ownerDepartment as string) ?? (r.owner_department as string) ?? "",
    isRequiredForCosting: (r.isRequiredForCosting as boolean) ?? (r.is_required_for_costing as boolean) ?? false,
    lookupMasterCode: (r.lookupMasterCode as string) ?? (r.lookup_master_code as string) ?? "",
    displayOrder: Number((r.displayOrder as number) ?? (r.display_order as number) ?? 0),
    displayGroup: (r.displayGroup as string) ?? (r.display_group as string) ?? "",
  }
}
