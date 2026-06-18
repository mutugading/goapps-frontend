import { useQuery } from "@tanstack/react-query"
import { useLookupMasters } from "@/hooks/finance/use-lookup-master"
import type { LookupMaster } from "@/types/finance/lookup-master"

interface MasterOption {
  value: string // the code stored to CPP (e.g., machine code)
  label: string // display text in dropdown
}

async function fetchOptionsForMaster(config: {
  lmApiPath: string
  lmCodeField: string
  lmLabelField: string
}): Promise<MasterOption[]> {
  const res = await fetch(`${config.lmApiPath}?pageSize=500&activeFilter=1`)
  if (!res.ok) throw new Error(`Failed to fetch options: ${res.status}`)
  const json = (await res.json()) as {
    data?: { items?: Record<string, unknown>[] } | Record<string, unknown>[]
  }
  const items: Record<string, unknown>[] = Array.isArray(json.data)
    ? json.data
    : ((json.data as { items?: Record<string, unknown>[] })?.items ?? [])
  return items
    .map((item) => ({
      value: String(item[config.lmCodeField] ?? ""),
      label: String(item[config.lmLabelField] ?? item[config.lmCodeField] ?? ""),
    }))
    .filter((o) => o.value !== "")
}

export function useMasterLookupOptions(lookupMasterCode: string | undefined) {
  const { data: masters = [] } = useLookupMasters(true)
  const config = masters.find((m: LookupMaster) => m.lmCode === lookupMasterCode)

  return useQuery({
    queryKey: ["finance", "master-lookup", "options", lookupMasterCode],
    queryFn: () => fetchOptionsForMaster(config!),
    enabled: !!lookupMasterCode && !!config,
    staleTime: 60_000,
  })
}
