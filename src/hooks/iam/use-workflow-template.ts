"use client"

// Workflow Template — TanStack Query hooks (CRUD + activate).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type {
  WorkflowTemplate,
  WorkflowTemplateStepInput,
} from "@/types/iam/workflow"

export const workflowTemplateKeys = {
  all: ["iam", "workflow-template"] as const,
  list: (params: ListWorkflowTemplatesParams) =>
    ["iam", "workflow-template", "list", JSON.stringify(params)] as const,
  detail: (id: string) => ["iam", "workflow-template", "detail", id] as const,
}

export interface ListWorkflowTemplatesParams {
  search?: string
  kind?: string
  activeFilter?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: string
}

export interface CreateTemplatePayload {
  kind: string
  name: string
  description?: string
  steps: WorkflowTemplateStepInput[]
}

export interface UpdateTemplatePayload {
  name: string
  description?: string
  steps: WorkflowTemplateStepInput[]
}

interface BFFEnvelope<T> {
  base?: { isSuccess: boolean; statusCode: string; message: string }
  data?: T
  pagination?: {
    currentPage: number
    pageSize: number
    totalItems: number | string
    totalPages: number
  }
}

function buildQuery(params: ListWorkflowTemplatesParams): string {
  const q = new URLSearchParams()
  if (params.search) q.set("search", params.search)
  if (params.kind) q.set("kind", params.kind)
  if (params.activeFilter) q.set("activeFilter", params.activeFilter)
  if (params.page) q.set("page", String(params.page))
  if (params.pageSize) q.set("pageSize", String(params.pageSize))
  if (params.sortBy) q.set("sortBy", params.sortBy)
  if (params.sortOrder) q.set("sortOrder", params.sortOrder)
  const s = q.toString()
  return s ? `?${s}` : ""
}

export interface ListWorkflowTemplatesResult {
  data: WorkflowTemplate[]
  pagination: BFFEnvelope<unknown>["pagination"]
}

async function listTemplates(params: ListWorkflowTemplatesParams): Promise<ListWorkflowTemplatesResult> {
  const res = await fetch(`/api/v1/iam/workflow-templates${buildQuery(params)}`, {
    credentials: "include",
  })
  const json = (await res.json()) as BFFEnvelope<WorkflowTemplate[]>
  return { data: json.data ?? [], pagination: json.pagination }
}

async function createTemplate(payload: CreateTemplatePayload): Promise<WorkflowTemplate> {
  const res = await fetch(`/api/v1/iam/workflow-templates`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = (await res.json()) as BFFEnvelope<WorkflowTemplate>
  if (!json.base?.isSuccess || !json.data) {
    throw new Error(json.base?.message || "Failed to create workflow template")
  }
  return json.data
}

async function updateTemplate(templateId: string, payload: UpdateTemplatePayload): Promise<WorkflowTemplate> {
  const res = await fetch(`/api/v1/iam/workflow-templates/${encodeURIComponent(templateId)}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  const json = (await res.json()) as BFFEnvelope<WorkflowTemplate>
  if (!json.base?.isSuccess || !json.data) {
    throw new Error(json.base?.message || "Failed to update workflow template")
  }
  return json.data
}

async function deleteTemplate(templateId: string): Promise<void> {
  const res = await fetch(`/api/v1/iam/workflow-templates/${encodeURIComponent(templateId)}`, {
    method: "DELETE",
    credentials: "include",
  })
  const json = (await res.json()) as BFFEnvelope<unknown>
  if (json.base && json.base.isSuccess === false) {
    throw new Error(json.base.message || "Failed to delete workflow template")
  }
}

async function activateTemplate(templateId: string): Promise<WorkflowTemplate> {
  const res = await fetch(
    `/api/v1/iam/workflow-templates/${encodeURIComponent(templateId)}/activate`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
  )
  const json = (await res.json()) as BFFEnvelope<WorkflowTemplate>
  if (!json.base?.isSuccess || !json.data) {
    throw new Error(json.base?.message || "Failed to activate workflow template")
  }
  return json.data
}

// =============================================================================
// Hooks
// =============================================================================

export function useWorkflowTemplates(params: ListWorkflowTemplatesParams = {}) {
  return useQuery({
    queryKey: workflowTemplateKeys.list(params),
    queryFn: () => listTemplates(params),
    staleTime: 30_000,
  })
}

export function useCreateWorkflowTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTemplatePayload) => createTemplate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workflowTemplateKeys.all })
      toast.success("Workflow template created (inactive — activate to use)")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create workflow template")
    },
  })
}

export function useUpdateWorkflowTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ templateId, payload }: { templateId: string; payload: UpdateTemplatePayload }) =>
      updateTemplate(templateId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workflowTemplateKeys.all })
      toast.success("New version created (inactive — activate to use)")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update workflow template")
    },
  })
}

export function useDeleteWorkflowTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (templateId: string) => deleteTemplate(templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workflowTemplateKeys.all })
      toast.success("Workflow template deleted")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete workflow template")
    },
  })
}

export function useActivateWorkflowTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (templateId: string) => activateTemplate(templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workflowTemplateKeys.all })
      toast.success("Workflow template activated")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to activate workflow template")
    },
  })
}
