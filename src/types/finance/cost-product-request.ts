// Canonical Phase A — CostProductRequest (CPR_) + CostProductSpec (CPS_).
export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "ROUTING_DEFINED"
  | "PARAMETER_PENDING"
  | "PARAMETER_COMPLETE"
  | "COSTING_DONE"
  | "QUOTED"
  | "QUOTE_READY"
  | "CLOSED"
  | "REJECTED"

export type ClosedSubstatus = "won" | "lost" | "cancelled" | "on_hold"
export type ProductClassification = "existing" | "new"
export type UrgencyLevel = "low" | "medium" | "high"
export type RawMaterialType = "POY_BOUGHTOUT" | "CHIPS_SD" | "CHIPS_BRT" | "CHIPS_RECYCLE"
export type BoxType = "JUMBO" | "NORMAL" | "PALLET"

export interface CostProductSpec {
  specId: number
  requestId: number
  rawMaterialType: RawMaterialType | string
  productDescription: string
  shadeId?: number
  shadeCustomText?: string
  paperTubeTypeId: number
  paperTubeLabel?: string
  weightPerBobbinKg: string
  boxType: BoxType | string
  createdAt?: string
  createdBy?: string
}

export interface CostProductRequest {
  requestId: number
  requestNo: string
  requestTypeId: number
  requestTypeCode?: string
  title: string
  description: string
  customerName: string
  customerCode?: string
  productClassification: ProductClassification
  verifiedClassification?: ProductClassification
  classificationOverrideReason?: string
  targetVolume?: string
  targetPriceRange?: string
  urgencyLevel: UrgencyLevel
  neededByDate?: string
  status: RequestStatus
  closedSubstatus?: ClosedSubstatus
  feasibilityDecision?: "FEASIBLE" | "NOT_FEASIBLE" | string
  feasibilityNote?: string
  feasibilityBy?: string
  feasibilityAt?: string
  rejectReason?: string
  cancelReason?: string
  assignedToUserId?: string
  requesterUserId: string
  linkedRouteHeadId?: number
  createdAt?: string
  updatedAt?: string
  spec?: CostProductSpec
}

export interface SpecInput {
  rawMaterialType: RawMaterialType
  productDescription: string
  shadeId?: number
  shadeCustomText?: string
  paperTubeTypeId: number
  weightPerBobbinKg: string
  boxType: BoxType
}

export interface CreateCostProductRequestPayload {
  requestTypeId: number
  title: string
  description?: string
  customerName: string
  customerCode?: string
  productClassification: ProductClassification
  targetVolume?: string
  targetPriceRange?: string
  urgencyLevel?: UrgencyLevel
  neededByDate?: string
  spec?: SpecInput
}

export type UpdateCostProductRequestPayload = CreateCostProductRequestPayload

export interface ListCostProductRequestsParams {
  search?: string
  status?: RequestStatus | ""
  requestTypeId?: number
  requesterUserId?: string
  assigneeUserId?: string
  page?: number
  pageSize?: number
  sortBy?: "request_no" | "created_at" | "updated_at" | "status" | ""
  sortOrder?: "asc" | "desc"
}

type Raw = Record<string, unknown> & {
  audit?: {
    createdAt?: string
    created_at?: string
    updatedAt?: string
    updated_at?: string
  }
  spec?: Record<string, unknown> | null
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0))
const numOpt = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "" || v === 0 || v === "0") return undefined
  return Number(v)
}

function normalizeSpec(raw: Record<string, unknown>, requestId: number): CostProductSpec {
  return {
    specId: num(raw.specId ?? raw.spec_id),
    requestId,
    rawMaterialType: str(raw.rawMaterialType ?? raw.raw_material_type),
    productDescription: str(raw.productDescription ?? raw.product_description),
    shadeId: numOpt(raw.shadeId ?? raw.shade_id),
    shadeCustomText: str(raw.shadeCustomText ?? raw.shade_custom_text) || undefined,
    paperTubeTypeId: num(raw.paperTubeTypeId ?? raw.paper_tube_type_id),
    paperTubeLabel: str(raw.paperTubeLabel ?? raw.paper_tube_label) || undefined,
    weightPerBobbinKg: str(raw.weightPerBobbinKg ?? raw.weight_per_bobbin_kg),
    boxType: str(raw.boxType ?? raw.box_type),
    createdAt: str(raw.createdAt ?? raw.created_at) || undefined,
    createdBy: str(raw.createdBy ?? raw.created_by) || undefined,
  }
}

export function normalizeCostProductRequest(raw: Raw): CostProductRequest {
  const requestId = num(raw.requestId ?? raw.request_id)
  const classification = (str(raw.productClassification ?? raw.product_classification) || "existing") as ProductClassification
  const verified = str(raw.verifiedClassification ?? raw.verified_classification)
  return {
    requestId,
    requestNo: str(raw.requestNo ?? raw.request_no),
    requestTypeId: num(raw.requestTypeId ?? raw.request_type_id),
    requestTypeCode: str(raw.requestTypeCode ?? raw.request_type_code) || undefined,
    title: str(raw.title),
    description: str(raw.description),
    customerName: str(raw.customerName ?? raw.customer_name),
    customerCode: str(raw.customerCode ?? raw.customer_code) || undefined,
    productClassification: classification,
    verifiedClassification: (verified || undefined) as ProductClassification | undefined,
    classificationOverrideReason: str(raw.classificationOverrideReason ?? raw.classification_override_reason) || undefined,
    targetVolume: str(raw.targetVolume ?? raw.target_volume) || undefined,
    targetPriceRange: str(raw.targetPriceRange ?? raw.target_price_range) || undefined,
    urgencyLevel: (str(raw.urgencyLevel ?? raw.urgency_level) || "medium") as UrgencyLevel,
    neededByDate: str(raw.neededByDate ?? raw.needed_by_date) || undefined,
    status: (str(raw.status) || "DRAFT") as RequestStatus,
    closedSubstatus: (str(raw.closedSubstatus ?? raw.closed_substatus) || undefined) as ClosedSubstatus | undefined,
    feasibilityDecision: str(raw.feasibilityDecision ?? raw.feasibility_decision) || undefined,
    feasibilityNote: str(raw.feasibilityNote ?? raw.feasibility_note) || undefined,
    feasibilityBy: str(raw.feasibilityBy ?? raw.feasibility_by) || undefined,
    feasibilityAt: str(raw.feasibilityAt ?? raw.feasibility_at) || undefined,
    rejectReason: str(raw.rejectReason ?? raw.reject_reason) || undefined,
    cancelReason: str(raw.cancelReason ?? raw.cancel_reason) || undefined,
    assignedToUserId: str(raw.assignedToUserId ?? raw.assigned_to_user_id) || undefined,
    requesterUserId: str(raw.requesterUserId ?? raw.requester_user_id),
    linkedRouteHeadId: numOpt(raw.linkedRouteHeadId ?? raw.linked_route_head_id),
    createdAt: raw.audit?.createdAt ?? raw.audit?.created_at,
    updatedAt: raw.audit?.updatedAt ?? raw.audit?.updated_at,
    spec: raw.spec ? normalizeSpec(raw.spec, requestId) : undefined,
  }
}
