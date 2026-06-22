"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  downloadTemplate,
  exportData,
  importSync,
  importAsync,
  getImportJob,
  listImportJobs,
} from "@/services/finance/cost-import-api"
import type {
  CostImportJob,
  ImportEntity,
  SyncImportResult,
} from "@/types/finance/cost-import"
import type { ListImportJobsParams } from "@/services/finance/cost-import-api"

export const costImportKeys = {
  job: (id: number) => ["finance", "cost-import", "job", id] as const,
  jobs: (params?: ListImportJobsParams) =>
    ["finance", "cost-import", "jobs", params] as const,
}

export function useImportJobs(params?: ListImportJobsParams, refetchIntervalMs?: number) {
  return useQuery({
    queryKey: costImportKeys.jobs(params),
    queryFn: () => listImportJobs(params),
    staleTime: 5000,
    refetchInterval: refetchIntervalMs,
  })
}

export function useDownloadTemplate() {
  const [loading, setLoading] = useState(false)

  const download = useCallback(async (entity: ImportEntity) => {
    setLoading(true)
    try {
      const blob = await downloadTemplate(entity)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `template_${entity}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      toast.error(`Template download failed: ${String(e)}`)
    } finally {
      setLoading(false)
    }
  }, [])

  return { download, loading }
}

export function useExportData() {
  const [loading, setLoading] = useState(false)

  const exportEntity = useCallback(
    async (entity: ImportEntity, params?: Record<string, string>) => {
      setLoading(true)
      try {
        const blob = await exportData(entity, params)
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${entity}_export.xlsx`
        a.click()
        URL.revokeObjectURL(url)
      } catch (e) {
        toast.error(`Export failed: ${String(e)}`)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { exportEntity, loading }
}

export function useSyncImport(entity: ImportEntity, onSuccess?: () => void) {
  return useMutation({
    mutationFn: ({
      file,
      duplicateAction,
    }: {
      file: File
      duplicateAction: "skip" | "update" | "error"
    }) => importSync(entity, file, duplicateAction),
    onSuccess: (result: SyncImportResult) => {
      if (result.failedCount > 0) {
        toast.warning(
          `Import completed with ${result.failedCount} errors. ${result.successCount} rows imported.`,
        )
      } else {
        toast.success(
          `Import complete: ${result.successCount} created, ${result.updatedCount} updated, ${result.skippedCount} skipped.`,
        )
      }
      onSuccess?.()
    },
    onError: (e) => toast.error(`Import failed: ${String(e)}`),
  })
}

export function useAsyncImport(entity: ImportEntity, onComplete?: () => void) {
  const [jobId, setJobId] = useState<number | null>(null)
  const [polling, setPolling] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const submitMutation = useMutation({
    mutationFn: ({
      file,
      duplicateAction,
    }: {
      file: File
      duplicateAction: "skip" | "update" | "error"
    }) => importAsync(entity, file, duplicateAction),
    onSuccess: ({ jobId: id }) => {
      setJobId(id)
      setPolling(true)
    },
    onError: (e) => toast.error(`Failed to start import: ${String(e)}`),
  })

  const { data: job } = useQuery<CostImportJob>({
    queryKey: costImportKeys.job(jobId ?? 0),
    queryFn: () => getImportJob(jobId!),
    enabled: polling && jobId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === "DONE" || status === "FAILED" || status === "PARTIAL")
        return false
      return 3000
    },
  })

  useEffect(() => {
    if (!job) return
    if (job.status === "DONE") {
      setPolling(false)
      toast.success(`Import complete: ${job.success} rows imported.`)
      onCompleteRef.current?.()
    } else if (job.status === "PARTIAL") {
      setPolling(false)
      toast.warning(`Import completed with ${job.failed} errors.`)
      onCompleteRef.current?.()
    } else if (job.status === "FAILED") {
      setPolling(false)
      toast.error("Import failed. Check error report.")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status])

  function reset() {
    setJobId(null)
    setPolling(false)
  }

  return { submitMutation, job, polling, jobId, reset }
}
