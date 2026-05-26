// Canonical Phase A — CostPaperTubeType (CPTT_).
export interface CostPaperTubeType {
  paperTubeTypeId: number
  code: string
  displayName: string
  isActive: boolean
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0))

export function normalizeCostPaperTubeType(raw: Record<string, unknown>): CostPaperTubeType {
  return {
    paperTubeTypeId: num(raw.paperTubeTypeId ?? raw.paper_tube_type_id),
    code: str(raw.code),
    displayName: str(raw.displayName ?? raw.display_name),
    isActive: (raw.isActive ?? raw.is_active ?? true) as boolean,
  }
}
