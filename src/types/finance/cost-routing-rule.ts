// Canonical Phase A — CostRoutingRule (CRR_).
export type RoutingActionType = "AUTO_ASSIGN" | "TO_TRIAGE"

export interface CostRoutingRule {
  ruleId: number
  priority: number
  condition: string // JSON string
  actionType: RoutingActionType
  actionTarget?: string
  isActive: boolean
  createdBy: string
  createdAt: string
}

export interface ListCostRoutingRulesParams {
  activeFilter?: "all" | "active" | "inactive" | ""
  page?: number
  pageSize?: number
}

export interface CreateCostRoutingRulePayload {
  priority: number
  condition: string
  actionType: RoutingActionType
  actionTarget?: string
}

export interface UpdateCostRoutingRulePayload extends CreateCostRoutingRulePayload {
  isActive: boolean
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0))

export function normalizeCostRoutingRule(raw: Record<string, unknown>): CostRoutingRule {
  return {
    ruleId: num(raw.ruleId ?? raw.rule_id),
    priority: num(raw.priority),
    condition: str(raw.condition),
    actionType: (str(raw.actionType ?? raw.action_type) || "TO_TRIAGE") as RoutingActionType,
    actionTarget: str(raw.actionTarget ?? raw.action_target) || undefined,
    isActive: (raw.isActive ?? raw.is_active ?? true) as boolean,
    createdBy: str(raw.createdBy ?? raw.created_by),
    createdAt: str(raw.createdAt ?? raw.created_at),
  }
}
