"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  type CostCommentEditHistory,
  type CostRequestComment,
  normalizeCostCommentEditHistory,
  normalizeCostRequestComment,
} from "@/types/finance/cost-request-comment"

const KEYS = {
  all: ["finance", "cost-request-comment"] as const,
  byRequest: (requestId: number, includeHidden: boolean) =>
    ["finance", "cost-request-comment", "by-request", requestId, includeHidden] as const,
  history: (commentId: number) => ["finance", "cost-request-comment", "history", commentId] as const,
}

export function useRequestComments(requestId: number | undefined, includeHidden = false) {
  return useQuery({
    queryKey: KEYS.byRequest(requestId ?? 0, includeHidden),
    queryFn: async (): Promise<CostRequestComment[]> => {
      if (!requestId) return []
      const qs = includeHidden ? "?includeHidden=true" : ""
      const res = await fetch(`/api/v1/finance/cost-product-requests/${requestId}/comments${qs}`)
      const json = await res.json()
      return ((json.data as unknown[]) || []).map((r) =>
        normalizeCostRequestComment(r as Record<string, unknown>),
      )
    },
    enabled: !!requestId,
    staleTime: 15_000,
  })
}

export function useCommentEditHistory(commentId: number | undefined) {
  return useQuery({
    queryKey: KEYS.history(commentId ?? 0),
    queryFn: async (): Promise<CostCommentEditHistory[]> => {
      if (!commentId) return []
      const res = await fetch(`/api/v1/finance/cost-request-comments/${commentId}/edit-history`)
      const json = await res.json()
      return ((json.data as unknown[]) || []).map((r) =>
        normalizeCostCommentEditHistory(r as Record<string, unknown>),
      )
    },
    enabled: !!commentId,
  })
}

interface CreatePayload {
  requestId: number
  parentCommentId?: number
  bodyRichtext: string
  bodyPlaintext: string
  mentionedUserIds?: string[]
}

export function useCreateRequestComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const res = await fetch("/api/v1/finance/cost-request-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostRequestComment(json.data)
    },
    onSuccess: (c) => {
      toast.success("Comment posted")
      qc.invalidateQueries({ queryKey: ["finance", "cost-request-comment", "by-request", c.requestId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

interface UpdatePayload {
  commentId: number
  bodyRichtext: string
  bodyPlaintext: string
  mentionedUserIds?: string[]
}

export function useUpdateRequestComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdatePayload) => {
      const { commentId, ...rest } = payload
      const res = await fetch(`/api/v1/finance/cost-request-comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rest),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostRequestComment(json.data)
    },
    onSuccess: (c) => {
      toast.success("Comment updated")
      qc.invalidateQueries({ queryKey: ["finance", "cost-request-comment", "by-request", c.requestId] })
      qc.invalidateQueries({ queryKey: KEYS.history(c.commentId) })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useHideRequestComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { commentId: number; hiddenReason: string }) => {
      const res = await fetch(`/api/v1/finance/cost-request-comments/${input.commentId}/hide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hiddenReason: input.hiddenReason }),
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostRequestComment(json.data)
    },
    onSuccess: (c) => {
      toast.success("Comment hidden")
      qc.invalidateQueries({ queryKey: ["finance", "cost-request-comment", "by-request", c.requestId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUnhideRequestComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { commentId: number }) => {
      const res = await fetch(`/api/v1/finance/cost-request-comments/${input.commentId}/unhide`, { method: "POST" })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostRequestComment(json.data)
    },
    onSuccess: (c) => {
      toast.success("Comment unhidden")
      qc.invalidateQueries({ queryKey: ["finance", "cost-request-comment", "by-request", c.requestId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteRequestComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { commentId: number; requestId: number }) => {
      const res = await fetch(`/api/v1/finance/cost-request-comments/${input.commentId}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return input
    },
    onSuccess: ({ requestId }) => {
      toast.success("Comment deleted")
      qc.invalidateQueries({ queryKey: ["finance", "cost-request-comment", "by-request", requestId] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const costRequestCommentKeys = KEYS
