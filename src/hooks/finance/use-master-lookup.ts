import { useQuery } from "@tanstack/react-query"
import type { MasterOption } from "@/types/finance/lookup-master"

export function useMasterLookupOptions(lookupMasterCode: string | undefined) {
  return useQuery<MasterOption[]>({
    queryKey: ["finance", "master-lookup", "options", lookupMasterCode],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/finance/lookup-master-options?masterCode=${encodeURIComponent(lookupMasterCode!)}`,
      )
      if (!res.ok) throw new Error(`Failed to fetch ${lookupMasterCode} options: ${res.status}`)
      const json = (await res.json()) as { data?: MasterOption[] }
      return json.data ?? []
    },
    enabled: !!lookupMasterCode,
    staleTime: 60_000,
  })
}
