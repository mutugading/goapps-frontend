"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  normalizeFillTask,
  normalizeLevelConfig,
  type FillTask,
  type LevelAssignmentConfig,
} from "@/types/finance/fill-assignment";

// Query keys
export const fillAssignmentKeys = {
  all: ["finance", "fill-assignment"] as const,
  configs: () => [...fillAssignmentKeys.all, "config"] as const,
  tasks: (requestId: number) =>
    [...fillAssignmentKeys.all, "tasks", requestId] as const,
};

// --- Config queries ---

export function useGlobalFillConfigs() {
  return useQuery({
    queryKey: fillAssignmentKeys.configs(),
    queryFn: async (): Promise<LevelAssignmentConfig[]> => {
      const res = await fetch("/api/v1/finance/fill-configs");
      if (!res.ok) throw new Error("Failed to fetch fill configs");
      const json = await res.json();
      const items = (json.data ?? []) as Record<string, unknown>[];
      return items.map(normalizeLevelConfig);
    },
    staleTime: 60_000,
  });
}

// --- Task queries ---

export function useFillTasks(requestId: number) {
  return useQuery({
    queryKey: fillAssignmentKeys.tasks(requestId),
    queryFn: async (): Promise<FillTask[]> => {
      const res = await fetch(
        `/api/v1/finance/fill-tasks?request_id=${requestId}`
      );
      if (!res.ok) throw new Error("Failed to fetch fill tasks");
      const json = await res.json();
      const items = (json.data ?? []) as Record<string, unknown>[];
      return items.map(normalizeFillTask);
    },
    enabled: requestId > 0,
    staleTime: 30_000,
  });
}

// --- Config mutations ---

export function useUpsertFillConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      routeLevel: number;
      tier: string;
      fillerType: string;
      fillerValue: string;
      approverType?: string;
      approverValue?: string;
      reapproveOnChange?: boolean;
      slaFillHours?: number;
      slaApproveHours?: number;
      productSysId?: number;
      requestId?: number;
    }) => {
      const res = await fetch("/api/v1/finance/fill-configs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to upsert fill config");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Fill config saved");
      void qc.invalidateQueries({ queryKey: fillAssignmentKeys.configs() });
    },
    onError: () => toast.error("Failed to save fill config"),
  });
}

export function useDeleteGlobalFillConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (routeLevel: number) => {
      const res = await fetch(
        `/api/v1/finance/fill-configs/global/${routeLevel}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete fill config");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Fill config deleted");
      void qc.invalidateQueries({ queryKey: fillAssignmentKeys.configs() });
    },
    onError: () => toast.error("Failed to delete fill config"),
  });
}

// --- Task mutations ---

export function useClaimFillTask(requestId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/v1/finance/fill-tasks/${taskId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Failed to claim task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Task claimed");
      void qc.invalidateQueries({
        queryKey: fillAssignmentKeys.tasks(requestId),
      });
    },
    onError: () => toast.error("Failed to claim task"),
  });
}

export function useSubmitFillTask(requestId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/v1/finance/fill-tasks/${taskId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) throw new Error("Failed to submit task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Fill task submitted");
      void qc.invalidateQueries({
        queryKey: fillAssignmentKeys.tasks(requestId),
      });
    },
    onError: () => toast.error("Failed to submit fill task"),
  });
}

export function useApproveFillTask(requestId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, note }: { taskId: number; note?: string }) => {
      const res = await fetch(`/api/v1/finance/fill-tasks/${taskId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, note }),
      });
      if (!res.ok) throw new Error("Failed to approve task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Fill task approved");
      void qc.invalidateQueries({
        queryKey: fillAssignmentKeys.tasks(requestId),
      });
    },
    onError: () => toast.error("Failed to approve task"),
  });
}

export function useRejectFillTask(requestId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      taskId,
      reason,
    }: {
      taskId: number;
      reason: string;
    }) => {
      const res = await fetch(`/api/v1/finance/fill-tasks/${taskId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to reject task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Fill task rejected");
      void qc.invalidateQueries({
        queryKey: fillAssignmentKeys.tasks(requestId),
      });
    },
    onError: () => toast.error("Failed to reject task"),
  });
}
