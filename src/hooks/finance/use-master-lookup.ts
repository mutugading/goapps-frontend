import { useQuery } from "@tanstack/react-query"
import { LOOKUP_MASTER_CONFIG } from "@/types/finance/yarn-master"

interface MasterOption {
  value: string // the code stored to CPP (e.g., machine code)
  label: string // display text in dropdown
}

async function fetchMasterOptions(lookupMasterCode: string): Promise<MasterOption[]> {
  const config = LOOKUP_MASTER_CONFIG[lookupMasterCode]
  if (!config) return []

  const res = await fetch(`${config.apiPath}?pageSize=500&activeFilter=1`)
  if (!res.ok) throw new Error(`Failed to fetch ${lookupMasterCode} options: ${res.status}`)
  const json = (await res.json()) as {
    data?: { items?: Record<string, unknown>[] } | Record<string, unknown>[]
  }
  const items: Record<string, unknown>[] = Array.isArray(json.data)
    ? json.data
    : ((json.data as { items?: Record<string, unknown>[] })?.items ?? [])
  return items
    .map((item) => ({
      value: String(item[config.codeField] ?? ""),
      label: String(item[config.labelField] ?? item[config.codeField] ?? ""),
    }))
    .filter((o) => o.value !== "")
}

export function useMasterLookupOptions(lookupMasterCode: string | undefined) {
  return useQuery({
    queryKey: ["finance", "master-lookup", "options", lookupMasterCode],
    queryFn: () => fetchMasterOptions(lookupMasterCode!),
    enabled: !!lookupMasterCode,
    staleTime: 60_000,
  })
}
