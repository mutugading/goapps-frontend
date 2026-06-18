import { useQuery } from "@tanstack/react-query"
import type { LookupMaster, LookupMasterColumn } from "@/types/finance/lookup-master"

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
