// Canonical Phase A — CostRequestType (PRD §7.1.3, CRT_).
export interface CostRequestType {
  typeId: number
  code: string
  displayName: string
  stateMachineVariant: "FULL" | "SHORTCUT_CAPABLE" | string
  defaultUrgency: string
  isActive: boolean
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0))

export function normalizeCostRequestType(raw: Record<string, unknown>): CostRequestType {
  return {
    typeId: num(raw.typeId ?? raw.type_id),
    code: str(raw.code),
    displayName: str(raw.displayName ?? raw.display_name),
    stateMachineVariant: str(raw.stateMachineVariant ?? raw.state_machine_variant) || "FULL",
    defaultUrgency: str(raw.defaultUrgency ?? raw.default_urgency) || "medium",
    isActive: (raw.isActive ?? raw.is_active ?? true) as boolean,
  }
}
