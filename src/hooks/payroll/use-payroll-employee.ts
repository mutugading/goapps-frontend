"use client"

// Payroll employee hooks (T033n3): detail by NIK and the backdated tax-status correction (D-82 (6)).

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ApiError, apiClient, buildQueryString } from "@/lib/api"
import {
  CorrectEmployeeTaxStatusResponse,
  GetEmployeeResponse,
} from "@/types/generated/payroll/v1/master"

export const MAX_TAX_REASON = 500
export const PERMISSION_TAX_STATUS_UPDATE = "payroll.master.taxstatus.update"

export const payrollEmployeeKeys = {
  all: ["payroll", "employee"] as const,
  detail: (nik: string, division?: string) => [...payrollEmployeeKeys.all, "detail", nik, division ?? ""] as const,
}

export function usePayrollEmployee(nik: string, division?: string) {
  return useQuery({
    queryKey: payrollEmployeeKeys.detail(nik, division),
    queryFn: async () => {
      const raw = await apiClient.get<unknown>(
        `/api/v1/payroll/employees/${encodeURIComponent(nik)}${buildQueryString({ division })}`
      )
      return GetEmployeeResponse.fromJSON(raw).data ?? null
    },
    enabled: nik !== "",
    staleTime: 30_000,
    // 4xx (404 not found, 403, ambiguous NIK) is a definitive answer: show it at once.
    retry: (count, error) => !(error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) && count < 2,
  })
}

export interface CorrectTaxStatusVars {
  id: number
  taxId: string
  /** YYYY-MM-DD. */
  validFrom: string
  reason: string
  ifMatch: string
}

export function correctTaxStatusPath(id: number): string {
  return `/api/v1/payroll/employees/id/${id}/tax-status-correction`
}

export function useCorrectTaxStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: CorrectTaxStatusVars) => {
      const raw = await apiClient.post<unknown>(correctTaxStatusPath(id), body)
      return CorrectEmployeeTaxStatusResponse.fromJSON(raw)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: payrollEmployeeKeys.all })
      toast.success("Tax status corrected")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to correct tax status")
    },
  })
}
