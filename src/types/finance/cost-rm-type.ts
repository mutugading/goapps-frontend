// Canonical Phase B — CostRmType (PRD §7.2.2, CRMT_).
export type ReferenceTarget = "PRODUCT" | "MASTER"

export interface CostRmType {
  typeId: number
  typeCode: string
  typeName: string
  referenceTarget: ReferenceTarget
  allowSubSequence: boolean
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ListCostRmTypesParams {
  search?: string
  referenceTarget?: ReferenceTarget | ""
  activeFilter?: "all" | "active" | "inactive" | ""
  page?: number
  pageSize?: number
}

type RawCostRmType = {
  typeId?: number | string
  type_id?: number | string
  typeCode?: string
  type_code?: string
  typeName?: string
  type_name?: string
  referenceTarget?: string
  reference_target?: string
  allowSubSequence?: boolean
  allow_sub_sequence?: boolean
  isActive?: boolean
  is_active?: boolean
  audit?: { createdAt?: string; created_at?: string; updatedAt?: string; updated_at?: string }
}

export function normalizeCostRmType(raw: RawCostRmType): CostRmType {
  const target = (raw.referenceTarget ?? raw.reference_target ?? "MASTER") as ReferenceTarget
  return {
    typeId: Number(raw.typeId ?? raw.type_id ?? 0),
    typeCode: raw.typeCode ?? raw.type_code ?? "",
    typeName: raw.typeName ?? raw.type_name ?? "",
    referenceTarget: target,
    allowSubSequence: raw.allowSubSequence ?? raw.allow_sub_sequence ?? false,
    isActive: raw.isActive ?? raw.is_active ?? true,
    createdAt: raw.audit?.createdAt ?? raw.audit?.created_at,
    updatedAt: raw.audit?.updatedAt ?? raw.audit?.updated_at,
  }
}
