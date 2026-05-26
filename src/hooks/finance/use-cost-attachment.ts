"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { type CostAttachment, normalizeCostAttachment } from "@/types/finance/cost-attachment"

const KEYS = {
  all: ["finance", "cost-attachment"] as const,
  byRequest: (requestId: number) => ["finance", "cost-attachment", "by-request", requestId] as const,
  byComment: (commentId: number) => ["finance", "cost-attachment", "by-comment", commentId] as const,
}

export function useAttachmentsByRequest(requestId: number | undefined) {
  return useQuery({
    queryKey: KEYS.byRequest(requestId ?? 0),
    queryFn: async (): Promise<CostAttachment[]> => {
      if (!requestId) return []
      const res = await fetch(`/api/v1/finance/cost-product-requests/${requestId}/attachments`)
      const json = await res.json()
      return ((json.data as unknown[]) || []).map((r) =>
        normalizeCostAttachment(r as Record<string, unknown>),
      )
    },
    enabled: !!requestId,
    staleTime: 30_000,
  })
}

export function useAttachmentsByComment(commentId: number | undefined) {
  return useQuery({
    queryKey: KEYS.byComment(commentId ?? 0),
    queryFn: async (): Promise<CostAttachment[]> => {
      if (!commentId) return []
      const res = await fetch(`/api/v1/finance/cost-request-comments/${commentId}/attachments`)
      const json = await res.json()
      return ((json.data as unknown[]) || []).map((r) =>
        normalizeCostAttachment(r as Record<string, unknown>),
      )
    },
    enabled: !!commentId,
    staleTime: 30_000,
  })
}

interface UploadInput {
  file: File
  requestId?: number
  commentId?: number
}

export function useUploadAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UploadInput) => {
      const formData = new FormData()
      formData.append("file", input.file)
      formData.append("filename", input.file.name)
      formData.append("mimeType", input.file.type || "application/octet-stream")
      if (input.requestId) formData.append("requestId", String(input.requestId))
      if (input.commentId) formData.append("commentId", String(input.commentId))
      const res = await fetch("/api/v1/finance/cost-attachments/upload", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return normalizeCostAttachment(json.data)
    },
    onSuccess: (a) => {
      toast.success(`Uploaded ${a.filename}`)
      if (a.requestId) qc.invalidateQueries({ queryKey: KEYS.byRequest(a.requestId) })
      if (a.commentId) qc.invalidateQueries({ queryKey: KEYS.byComment(a.commentId) })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useAttachmentDownloadURL() {
  return useMutation({
    mutationFn: async (input: { attachmentId: number }) => {
      const res = await fetch(`/api/v1/finance/cost-attachments/${input.attachmentId}/download-url`)
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return { url: String(json.url || ""), validSeconds: Number(json.validSeconds || 0) }
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteAttachment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { attachmentId: number; requestId?: number; commentId?: number }) => {
      const res = await fetch(`/api/v1/finance/cost-attachments/${input.attachmentId}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.base?.isSuccess) throw new Error(json.base?.message || "Failed")
      return input
    },
    onSuccess: (input) => {
      toast.success("Attachment deleted")
      if (input.requestId) qc.invalidateQueries({ queryKey: KEYS.byRequest(input.requestId) })
      if (input.commentId) qc.invalidateQueries({ queryKey: KEYS.byComment(input.commentId) })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export const costAttachmentKeys = KEYS
