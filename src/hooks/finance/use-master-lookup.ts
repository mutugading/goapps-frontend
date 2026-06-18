import { useQuery } from "@tanstack/react-query"
import type { LookupMaster } from "@/types/finance/lookup-master"

interface MasterOption {
  value: string // the code stored to CPP (e.g., machine code)
  label: string // display text in dropdown
}

async function fetchMasterOptions(lookupMasterCode: string): Promise<MasterOption[]> {
  // Get master config from API
  const configRes = await fetch(`/api/v1/finance/lookup-masters?activeOnly=true`)
  if (!configRes.ok) throw new Error(`Failed to fetch lookup masters: ${configRes.status}`)
  const configJson = (await configRes.json()) as { data?: LookupMaster[] }
  const config = (configJson.data ?? []).find((m) => m.lmCode === lookupMasterCode)
  if (!config) return []

  // Fetch options from master's own endpoint
  const res = await fetch(`${config.lmApiPath}?pageSize=500&activeFilter=1`)
  if (!res.ok) throw new Error(`Failed to fetch ${lookupMasterCode} options: ${res.status}`)
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
  return useQuery({
    queryKey: ["finance", "master-lookup", "options", lookupMasterCode],
    queryFn: () => fetchMasterOptions(lookupMasterCode!),
    enabled: !!lookupMasterCode,
    staleTime: 60_000,
  })
}
