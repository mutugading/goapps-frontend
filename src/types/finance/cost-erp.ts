// Canonical Phase B — ERP lookups (PRD §7.3, CEI_/CEG_/CES_). Items are fully managed (CRUD).
export interface CostErpItem {
  itemId: number
  itemCode: string
  itemName: string
  itemType: string
  isActive: boolean
  syncedAt?: string
}

// Form types for create/update operations
export interface CreateErpItemForm {
  itemCode: string
  itemName: string
  itemType: string
  isActive: boolean
}

export interface UpdateErpItemForm {
  itemName?: string
  itemType?: string
  isActive?: boolean
}

// Item type options derived from domain knowledge (ERP item types)
export const ERP_ITEM_TYPE_OPTIONS = [
  { value: "FG", label: "FG — Finished Goods" },
  { value: "RM", label: "RM — Raw Material" },
  { value: "INT", label: "INT — Intermediate" },
  { value: "WIP", label: "WIP — Work In Progress" },
  { value: "POY", label: "POY — Partially Oriented Yarn" },
  { value: "PTY", label: "PTY — Polyester Textured Yarn" },
  { value: "OTHER", label: "OTHER — Other" },
] as const

// Status filter options (string-based for ERP API)
export const ERP_ACTIVE_FILTER_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const

export interface CostErpGrade {
  gradeId: number
  gradeCode: string
  gradeName: string
  isActive: boolean
  syncedAt?: string
}

export interface CostErpShade {
  shadeId: number
  shadeCode: string
  shadeName: string
  isActive: boolean
  syncedAt?: string
}

export interface ListErpItemsParams {
  search?: string
  itemType?: string
  activeFilter?: "all" | "active" | "inactive"
  page?: number
  pageSize?: number
}

export interface ListErpLookupParams {
  search?: string
  activeFilter?: "all" | "active" | "inactive"
  page?: number
  pageSize?: number
}

type RawItem = {
  itemId?: number | string
  item_id?: number | string
  itemCode?: string
  item_code?: string
  itemName?: string
  item_name?: string
  itemType?: string
  item_type?: string
  isActive?: boolean
  is_active?: boolean
  syncedAt?: string
  synced_at?: string
}

export function normalizeErpItem(raw: RawItem): CostErpItem {
  return {
    itemId: Number(raw.itemId ?? raw.item_id ?? 0),
    itemCode: raw.itemCode ?? raw.item_code ?? "",
    itemName: raw.itemName ?? raw.item_name ?? "",
    itemType: raw.itemType ?? raw.item_type ?? "",
    isActive: raw.isActive ?? raw.is_active ?? true,
    syncedAt: raw.syncedAt ?? raw.synced_at,
  }
}

type RawGrade = {
  gradeId?: number | string
  grade_id?: number | string
  gradeCode?: string
  grade_code?: string
  gradeName?: string
  grade_name?: string
  isActive?: boolean
  is_active?: boolean
  syncedAt?: string
  synced_at?: string
}

export function normalizeErpGrade(raw: RawGrade): CostErpGrade {
  return {
    gradeId: Number(raw.gradeId ?? raw.grade_id ?? 0),
    gradeCode: raw.gradeCode ?? raw.grade_code ?? "",
    gradeName: raw.gradeName ?? raw.grade_name ?? "",
    isActive: raw.isActive ?? raw.is_active ?? true,
    syncedAt: raw.syncedAt ?? raw.synced_at,
  }
}

type RawShade = {
  shadeId?: number | string
  shade_id?: number | string
  shadeCode?: string
  shade_code?: string
  shadeName?: string
  shade_name?: string
  isActive?: boolean
  is_active?: boolean
  syncedAt?: string
  synced_at?: string
}

export function normalizeErpShade(raw: RawShade): CostErpShade {
  return {
    shadeId: Number(raw.shadeId ?? raw.shade_id ?? 0),
    shadeCode: raw.shadeCode ?? raw.shade_code ?? "",
    shadeName: raw.shadeName ?? raw.shade_name ?? "",
    isActive: raw.isActive ?? raw.is_active ?? true,
    syncedAt: raw.syncedAt ?? raw.synced_at,
  }
}
