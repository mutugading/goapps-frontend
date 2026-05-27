// API client for RM Cost async export.

interface BFFEnvelope<T> {
  base?: { isSuccess?: boolean; message?: string }
  data?: T
}

export interface RequestExportParams {
  period: string
  rmType?: number
  groupHeadId?: string
  search?: string
}

export interface ExportJobInfo {
  jobId: string
  jobCode: string
  status: string
}

export async function requestRMCostExport(params: RequestExportParams): Promise<ExportJobInfo> {
  const res = await fetch("/api/v1/finance/rm-costs/request-export", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })
  const json = (await res.json()) as BFFEnvelope<ExportJobInfo>
  if (json.base?.isSuccess === false) {
    throw new Error(json.base.message || "Failed to queue export")
  }
  return {
    jobId: json.data?.jobId ?? "",
    jobCode: json.data?.jobCode ?? "",
    status: json.data?.status ?? "",
  }
}
