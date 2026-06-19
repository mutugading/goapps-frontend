import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type {
  LookupMaster,
  LookupMasterColumn,
  TableColumn,
  MasterOption,
  UpdateLookupMasterForm,
} from "@/types/finance/lookup-master"

export function useLookupMasters(activeOnly = true) {
  return useQuery<LookupMaster[]>({
    queryKey: ["finance", "lookup-master", "list", activeOnly],
    queryFn: async () => {
      const res = await fetch(`/api/v1/finance/lookup-masters?activeOnly=${activeOnly}`)
      if (!res.ok) throw new Error(`Failed to fetch lookup masters: ${res.status}`)
      const json = (await res.json()) as { data?: LookupMaster[] }
      return json.data ?? []
    },
    staleTime: 5 * 60_000, // 5 minutes — registry rarely changes
  })
}

export function useLookupMasterColumns(masterCode: string | undefined) {
  return useQuery<LookupMasterColumn[]>({
    queryKey: ["finance", "lookup-master", "columns", masterCode],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/finance/lookup-master-columns?masterCode=${encodeURIComponent(masterCode!)}`,
      )
      if (!res.ok) throw new Error(`Failed to fetch columns for ${masterCode}: ${res.status}`)
      const json = (await res.json()) as { data?: LookupMasterColumn[] }
      return json.data ?? []
    },
    enabled: !!masterCode,
    staleTime: 5 * 60_000,
  })
}

export function useCreateLookupMaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      lmCode: string
      lmDisplayName: string
      lmApiPath: string
      lmCodeField: string
      lmLabelField: string
    }) => {
      const res = await fetch("/api/v1/finance/lookup-masters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = (await res.json()) as { base?: { isSuccess?: boolean; message?: string } }
      if (!json.base?.isSuccess) throw new Error(json.base?.message ?? "Failed to create lookup master")
      return json
    },
    onSuccess: () => {
      toast.success("Lookup master created")
      void qc.invalidateQueries({ queryKey: ["finance", "lookup-master"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteLookupMaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (lmCode: string) => {
      const res = await fetch(`/api/v1/finance/lookup-masters/${encodeURIComponent(lmCode)}`, {
        method: "DELETE",
      })
      const json = (await res.json()) as { base?: { isSuccess?: boolean; message?: string } }
      if (!json.base?.isSuccess) throw new Error(json.base?.message ?? "Failed to delete lookup master")
    },
    onSuccess: () => {
      toast.success("Lookup master deleted")
      void qc.invalidateQueries({ queryKey: ["finance", "lookup-master"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useCreateLookupMasterColumn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      lmcMasterCode: string
      lmcColumnName: string
      lmcDisplayName: string
      lmcDataType: string
      lmcSortOrder: number
    }) => {
      const res = await fetch("/api/v1/finance/lookup-master-columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = (await res.json()) as { base?: { isSuccess?: boolean; message?: string } }
      if (!json.base?.isSuccess) throw new Error(json.base?.message ?? "Failed to create column")
    },
    onSuccess: (_, vars) => {
      toast.success("Column added")
      void qc.invalidateQueries({ queryKey: ["finance", "lookup-master", "columns", vars.lmcMasterCode] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useDeleteLookupMasterColumn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ lmcId, masterCode }: { lmcId: string; masterCode: string }) => {
      const res = await fetch(`/api/v1/finance/lookup-master-columns/${encodeURIComponent(lmcId)}`, {
        method: "DELETE",
      })
      const json = (await res.json()) as { base?: { isSuccess?: boolean; message?: string } }
      if (!json.base?.isSuccess) throw new Error(json.base?.message ?? "Failed to delete column")
      return masterCode
    },
    onSuccess: (masterCode) => {
      toast.success("Column deleted")
      void qc.invalidateQueries({ queryKey: ["finance", "lookup-master", "columns", masterCode] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdateLookupMaster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateLookupMasterForm) => {
      const res = await fetch("/api/v1/finance/lookup-masters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = (await res.json()) as { base?: { isSuccess?: boolean; message?: string } }
      if (!json.base?.isSuccess) throw new Error(json.base?.message ?? "Failed to update lookup master")
      return json
    },
    onSuccess: () => {
      toast.success("Lookup master updated")
      void qc.invalidateQueries({ queryKey: ["finance", "lookup-master"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useTableColumns(tableName: string | undefined) {
  return useQuery<TableColumn[]>({
    queryKey: ["finance", "lookup-master", "table-columns", tableName],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/finance/lookup-master-table-columns?tableName=${encodeURIComponent(tableName!)}`,
      )
      if (!res.ok) throw new Error(`Failed to introspect ${tableName}: ${res.status}`)
      const json = (await res.json()) as { data?: TableColumn[] }
      return json.data ?? []
    },
    enabled: !!tableName && tableName.length > 0,
    staleTime: 30_000,
  })
}

export function useMasterOptions(masterCode: string | undefined) {
  return useQuery<MasterOption[]>({
    queryKey: ["finance", "lookup-master", "options", masterCode],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/finance/lookup-master-options?masterCode=${encodeURIComponent(masterCode!)}`,
      )
      if (!res.ok) throw new Error(`Failed to fetch options: ${res.status}`)
      const json = (await res.json()) as { data?: MasterOption[] }
      return json.data ?? []
    },
    enabled: !!masterCode,
    staleTime: 60_000,
  })
}

export function useExportLookupMasters() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/v1/finance/lookup-masters/export")
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "lookup_masters.xlsx"
      a.click()
      URL.revokeObjectURL(url)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useImportLookupMasters() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/v1/finance/lookup-masters/import", { method: "POST", body: fd })
      const json = (await res.json()) as {
        base?: { isSuccess?: boolean; message?: string }
        data?: { successCount: number; failedCount: number; errors: string[] }
      }
      if (!json.base?.isSuccess) throw new Error(json.base?.message ?? "Import failed")
      return json.data ?? { successCount: 0, failedCount: 0, errors: [] }
    },
    onSuccess: (data) => {
      toast.success(`Imported ${data.successCount} masters`)
      if (data.failedCount > 0) toast.error(`${data.failedCount} rows failed`)
      void qc.invalidateQueries({ queryKey: ["finance", "lookup-master"] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
