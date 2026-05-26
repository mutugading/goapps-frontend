"use client"

// Workflow Instance — TanStack Query hooks.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { WorkflowInstance } from "@/types/iam/workflow"

export const workflowKeys = {
  all: ["iam", "workflow"] as const,
  instances: () => ["iam", "workflow", "instance"] as const,
  instance: (id: string) => ["iam", "workflow", "instance", id] as const,
}

interface BFFEnvelope<T> {
  base?: { isSuccess: boolean; statusCode: string; message: string }
  data?: T
}

async function fetchInstance(instanceId: string): Promise<WorkflowInstance> {
  const res = await fetch(`/api/v1/iam/workflow-instances/${encodeURIComponent(instanceId)}`, {
    credentials: "include",
  })
  const json = (await res.json()) as BFFEnvelope<WorkflowInstance>
  if (!json.base?.isSuccess || !json.data) {
    throw new Error(json.base?.message || "Failed to fetch workflow instance")
  }
  return json.data
}

async function advanceInstance(instanceId: string, comment: string): Promise<WorkflowInstance> {
  const res = await fetch(`/api/v1/iam/workflow-instances/${encodeURIComponent(instanceId)}/advance`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  })
  const json = (await res.json()) as BFFEnvelope<WorkflowInstance>
  if (!json.base?.isSuccess || !json.data) {
    throw new Error(json.base?.message || "Failed to advance workflow")
  }
  return json.data
}

async function rejectInstance(instanceId: string, comment: string): Promise<WorkflowInstance> {
  const res = await fetch(`/api/v1/iam/workflow-instances/${encodeURIComponent(instanceId)}/reject`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  })
  const json = (await res.json()) as BFFEnvelope<WorkflowInstance>
  if (!json.base?.isSuccess || !json.data) {
    throw new Error(json.base?.message || "Failed to reject workflow")
  }
  return json.data
}

// =============================================================================
// Hooks
// =============================================================================

export function useWorkflowInstance(instanceId: string, enabled = true) {
  return useQuery({
    queryKey: workflowKeys.instance(instanceId),
    queryFn: () => fetchInstance(instanceId),
    enabled: enabled && !!instanceId,
    staleTime: 15_000,
  })
}

export function useAdvanceWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, comment }: { instanceId: string; comment?: string }) =>
      advanceInstance(instanceId, comment ?? ""),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: workflowKeys.instance(variables.instanceId) })
      qc.invalidateQueries({ queryKey: ["finance", "product"] })
      toast.success("Step approved")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve step")
    },
  })
}

export function useRejectWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ instanceId, comment }: { instanceId: string; comment: string }) =>
      rejectInstance(instanceId, comment),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: workflowKeys.instance(variables.instanceId) })
      qc.invalidateQueries({ queryKey: ["finance", "product"] })
      toast.success("Workflow rejected")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject workflow")
    },
  })
}
