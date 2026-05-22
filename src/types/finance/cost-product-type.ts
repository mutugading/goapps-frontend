// Canonical Phase B — CostProductType (PRD §7.2.1, CPT_).
export interface CostProductType {
  typeId: number
  typeCode: string
  typeName: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ListCostProductTypesParams {
  search?: string
  activeFilter?: "all" | "active" | "inactive" | ""
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  pageSize?: number
}

type RawCostProductType = {
  typeId?: number | string
  type_id?: number | string
  typeCode?: string
  type_code?: string
  typeName?: string
  type_name?: string
  isActive?: boolean
  is_active?: boolean
  audit?: { createdAt?: string; created_at?: string; updatedAt?: string; updated_at?: string }
}

export function normalizeCostProductType(raw: RawCostProductType): CostProductType {
  return {
    typeId: Number(raw.typeId ?? raw.type_id ?? 0),
    typeCode: raw.typeCode ?? raw.type_code ?? "",
    typeName: raw.typeName ?? raw.type_name ?? "",
    isActive: raw.isActive ?? raw.is_active ?? true,
    createdAt: raw.audit?.createdAt ?? raw.audit?.created_at,
    updatedAt: raw.audit?.updatedAt ?? raw.audit?.updated_at,
  }
}
