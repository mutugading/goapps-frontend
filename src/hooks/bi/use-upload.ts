"use client"

// BI Excel upload hooks — template download, parse (preview), commit, cancel, history.

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api"
import { normalizeUpload, type NormalizedUpload } from "@/types/bi/upload"

export const uploadKeys = {
  all: ["finance", "bi-upload"] as const,
  history: (page: number, pageSize: number) =>
    [...uploadKeys.all, "history", page, pageSize] as const,
}

interface BaseResponseLike {
  isSuccess?: boolean
  message?: string
  statusCode?: string
}

interface UploadEnvelope {
  base?: BaseResponseLike
  data?: unknown
  pagination?: unknown
}

/**
 * useUploadTemplate downloads a blank .xlsx template for a target type and
 * triggers a browser save. Tracks its own pending state (not a mutation cache).
 */
export function useUploadTemplate() {
  const [isDownloading, setIsDownloading] = useState(false)

  const download = useCallback(async (targetType: string) => {
    if (!targetType) {
      toast.error("Select a target type first")
      return
    }
    setIsDownloading(true)
    try {
      const res = await fetch(`/api/v1/finance/bi/uploads/template?type=${encodeURIComponent(targetType)}`)
      if (!res.ok) {
        let message = "Failed to download template"
        try {
          const json = (await res.json()) as UploadEnvelope
          message = json.base?.message ?? message
        } catch {
          // non-JSON body — keep default message
        }
        throw new Error(message)
      }
      const blob = await res.blob()
      const disposition = res.headers.get("Content-Disposition") ?? ""
      const match = /filename="?([^"]+)"?/.exec(disposition)
      const fileName = match?.[1] ?? `bi_upload_template_${targetType}.xlsx`

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("Template downloaded")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download template")
    } finally {
      setIsDownloading(false)
    }
  }, [])

  return { download, isDownloading }
}

interface ParseArgs {
  targetType: string
  file: File
}

/** useParseUpload uploads the .xlsx via multipart and returns a normalized preview. */
export function useParseUpload() {
  return useMutation<NormalizedUpload, Error, ParseArgs>({
    mutationFn: async ({ targetType, file }) => {
      const formData = new FormData()
      formData.append("target_type", targetType)
      formData.append("file", file)

      const res = await fetch("/api/v1/finance/bi/uploads/parse", {
        method: "POST",
        body: formData,
      })
      const json = (await res.json()) as UploadEnvelope
      if (!res.ok || !json.base?.isSuccess) {
        throw new Error(json.base?.message ?? "Failed to parse upload")
      }
      return normalizeUpload(json.data as Parameters<typeof normalizeUpload>[0])
    },
    onError: (err) => toast.error(err.message),
  })
}

/** useCommitUpload commits a previewed upload by its internal id. */
export function useCommitUpload() {
  const qc = useQueryClient()
  return useMutation<NormalizedUpload, Error, string>({
    mutationFn: async (uploadId) => {
      const raw = await apiClient.post<UploadEnvelope>(
        `/api/v1/finance/bi/uploads/${uploadId}/commit`,
        {}
      )
      if (!raw.base?.isSuccess) throw new Error(raw.base?.message ?? "Failed to commit upload")
      return normalizeUpload(raw.data as Parameters<typeof normalizeUpload>[0])
    },
    onSuccess: (committed) => {
      toast.success(`Committed ${committed.committedRows} row(s)`)
      void qc.invalidateQueries({ queryKey: uploadKeys.all })
    },
    onError: (err) => toast.error(err.message),
  })
}

/** useCancelUpload discards a previewed upload. */
export function useCancelUpload() {
  const qc = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (uploadId) => {
      const raw = await apiClient.post<UploadEnvelope>(
        `/api/v1/finance/bi/uploads/${uploadId}/cancel`,
        {}
      )
      if (!raw.base?.isSuccess) throw new Error(raw.base?.message ?? "Failed to cancel upload")
    },
    onSuccess: () => {
      toast.info("Upload cancelled")
      void qc.invalidateQueries({ queryKey: uploadKeys.all })
    },
    onError: (err) => toast.error(err.message),
  })
}

/** useUploadHistory lists recent uploads, paginated. */
export function useUploadHistory(page = 1, pageSize = 10) {
  return useQuery<NormalizedUpload[]>({
    queryKey: uploadKeys.history(page, pageSize),
    queryFn: async () => {
      const raw = await apiClient.get<UploadEnvelope>(
        `/api/v1/finance/bi/uploads?page=${page}&pageSize=${pageSize}`
      )
      if (!raw.base?.isSuccess) throw new Error(raw.base?.message ?? "Failed to list uploads")
      const rows = Array.isArray(raw.data) ? raw.data : []
      return rows.map((row) => normalizeUpload(row as Parameters<typeof normalizeUpload>[0]))
    },
    staleTime: 30_000,
  })
}
