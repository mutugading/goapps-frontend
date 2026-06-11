"use client"

import { useQuery } from "@tanstack/react-query"

interface Props {
  deptCode: string
  fallback?: string
}

async function fetchDeptByCode(code: string): Promise<{ deptName?: string }> {
  const res = await fetch(
    `/api/v1/iam/departments?dept_code=${encodeURIComponent(code)}&page_size=1`,
  )
  if (!res.ok) return {}
  const json = (await res.json()) as { data?: { deptName?: string }[] }
  const items = json.data ?? []
  return items[0] ?? {}
}

export function DeptName({ deptCode, fallback }: Props) {
  const { data } = useQuery({
    queryKey: ["iam", "dept", "display", deptCode],
    queryFn: () => fetchDeptByCode(deptCode),
    enabled: !!deptCode,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  if (!deptCode) return <span>{fallback ?? "—"}</span>
  const display = data?.deptName || deptCode
  return <span title={deptCode}>{display}</span>
}
