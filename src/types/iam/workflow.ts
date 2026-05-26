// Workflow (Template + Instance) types — re-exports + UI helpers.

export type {
  WorkflowTemplate,
  WorkflowTemplateStep,
  WorkflowTemplateStepInput,
  CreateWorkflowTemplateRequest,
  CreateWorkflowTemplateResponse,
  GetWorkflowTemplateRequest,
  GetWorkflowTemplateResponse,
  UpdateWorkflowTemplateRequest,
  UpdateWorkflowTemplateResponse,
  ActivateWorkflowTemplateRequest,
  ActivateWorkflowTemplateResponse,
  DeleteWorkflowTemplateRequest,
  DeleteWorkflowTemplateResponse,
  ListWorkflowTemplatesRequest,
  ListWorkflowTemplatesResponse,
  WorkflowInstance,
  WorkflowInstanceStep,
  StartWorkflowInstanceRequest,
  StartWorkflowInstanceResponse,
  AdvanceWorkflowInstanceRequest,
  AdvanceWorkflowInstanceResponse,
  RejectWorkflowInstanceRequest,
  RejectWorkflowInstanceResponse,
  GetWorkflowInstanceRequest,
  GetWorkflowInstanceResponse,
  ListWorkflowInstancesRequest,
  ListWorkflowInstancesResponse,
} from "@/types/generated/iam/v1/workflow"

export {
  WorkflowTemplate as WorkflowTemplateParser,
  WorkflowInstance as WorkflowInstanceParser,
  GetWorkflowInstanceResponse as GetWorkflowInstanceResponseParser,
  AdvanceWorkflowInstanceResponse as AdvanceWorkflowInstanceResponseParser,
  RejectWorkflowInstanceResponse as RejectWorkflowInstanceResponseParser,
  ListWorkflowInstancesResponse as ListWorkflowInstancesResponseParser,
  ListWorkflowTemplatesResponse as ListWorkflowTemplatesResponseParser,
  CreateWorkflowTemplateResponse as CreateWorkflowTemplateResponseParser,
} from "@/types/generated/iam/v1/workflow"

// =============================================================================
// UI labels + badge variants
// =============================================================================

export const WORKFLOW_INSTANCE_STATUS_LABEL: Record<string, string> = {
  IN_PROGRESS: "In Progress",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  LOCKED: "Locked",
  UNLOCKED: "Unlocked",
}

export const WORKFLOW_INSTANCE_STATUS_BADGE: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  IN_PROGRESS: "default",
  APPROVED: "secondary",
  REJECTED: "destructive",
  LOCKED: "secondary",
  UNLOCKED: "outline",
}

export const STEP_DECISION_LABEL: Record<string, string> = {
  "": "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REASSIGNED: "Reassigned",
  SKIPPED: "Skipped",
}

export const STEP_DECISION_BADGE: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "": "outline",
  APPROVED: "default",
  REJECTED: "destructive",
  REASSIGNED: "secondary",
  SKIPPED: "outline",
}

export const RESOLUTION_TYPE_LABEL: Record<string, string> = {
  ROLE: "Role",
  USER: "User",
  DEPT: "Department",
}
