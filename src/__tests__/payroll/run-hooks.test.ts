// Payroll run/period hook keys and request paths (T030a).
import { describe, it, expect, vi, beforeEach } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { ApiError } from "@/lib/api"
import { payrollRunKeys, payrollPeriodKeys, periodActionPath, shouldRetryRunQuery, useExportPayrollReport, exportSuccessMessage } from "@/hooks/payroll/use-payroll-run"

describe("payroll query keys", () => {
  it("are scoped under 'payroll'", () => {
    expect(payrollRunKeys.all).toEqual(["payroll", "run"])
    expect(payrollPeriodKeys.all).toEqual(["payroll", "period"])
  })

  it("list/detail/lines extend the base", () => {
    expect(payrollRunKeys.lists()).toEqual(["payroll", "run", "list"])
    expect(payrollRunKeys.list({ yymm: 202701 })).toEqual([
      "payroll", "run", "list", JSON.stringify({ yymm: 202701 }),
    ])
    expect(payrollRunKeys.detail(3)).toEqual(["payroll", "run", "detail", 3])
    expect(payrollRunKeys.lines(3, { page: 2 })[2]).toBe("lines")
    expect(payrollPeriodKeys.list("SOLO")).toEqual(["payroll", "period", "list", "SOLO"])
  })
})

describe("periodActionPath", () => {
  it("builds the BFF path and encodes the division", () => {
    expect(periodActionPath("approve", 202701, "SOLO")).toBe("/api/v1/payroll/periods/202701/SOLO/approve")
    expect(periodActionPath("reopen", 202701, "A B")).toBe("/api/v1/payroll/periods/202701/A%20B/reopen")
  })
})

const { toastError, toastSuccess } = vi.hoisted(() => ({ toastError: vi.fn(), toastSuccess: vi.fn() }))
vi.mock("sonner", () => ({ toast: { error: toastError, success: toastSuccess } }))

// T030h2: a failed export must always surface a toast (message from base.message, generic fallback otherwise).
describe("useExportPayrollReport errors", () => {
  const run = async (res: Partial<Response> | Error) => {
    const fetchMock = vi.fn(() => (res instanceof Error ? Promise.reject(res) : Promise.resolve(res as Response)))
    vi.stubGlobal("fetch", fetchMock)
    const { result } = renderHook(() => useExportPayrollReport())
    let ok = true
    await act(async () => {
      ok = await result.current.download({ kind: "reco", yymm: 202611, division: "SOLO" })
    })
    return ok
  }

  beforeEach(() => {
    toastError.mockClear()
    toastSuccess.mockClear()
  })

  it("shows the backend message on a 4xx/5xx JSON body", async () => {
    const ok = await run({ ok: false, json: async () => ({ base: { message: "run punya baris detail untuk NIK tanpa head" } }) })
    expect(ok).toBe(false)
    expect(toastError).toHaveBeenCalledWith("run punya baris detail untuk NIK tanpa head")
    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it("falls back to a generic toast on a non-JSON 500 or a network error", async () => {
    expect(await run({ ok: false, json: async () => { throw new Error("not json") } })).toBe(false)
    expect(toastError).toHaveBeenLastCalledWith("Failed to export report")
    expect(await run(new TypeError("network"))).toBe(false)
    expect(toastError).toHaveBeenLastCalledWith("network")
  })
})

describe("useExportPayrollReport success toast", () => {
  it("reads X-Skipped-No-Head-Count from the BFF headers (T030h3)", async () => {
    toastSuccess.mockClear()
    const res = {
      ok: true,
      blob: async () => new Blob(["x"]),
      headers: new Headers({
        "Content-Disposition": 'attachment; filename="bank_SOLO_2611.xlsx"',
        "X-Skipped-Count": "1",
        "X-Skipped-No-Head-Count": "9",
      }),
    }
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(res as unknown as Response)))
    URL.createObjectURL = vi.fn(() => "blob:x")
    URL.revokeObjectURL = vi.fn()
    const { result } = renderHook(() => useExportPayrollReport())
    await act(async () => {
      await result.current.download({ kind: "bank", yymm: 202611, division: "SOLO", transferDate: "2026-11-26" })
    })
    expect(toastSuccess).toHaveBeenCalledWith("Report downloaded (1 employee(s) skipped; 9 karyawan tanpa head dilewati)")
  })
})

// T030h: 4xx answers are definitive; only 5xx/network errors get (at most 2) retries.
describe("exportSuccessMessage", () => {
  it("stays plain without skips", () => {
    expect(exportSuccessMessage("bank", 0, 0)).toBe("Report downloaded")
  })

  it("keeps the existing skipped wording per kind", () => {
    expect(exportSuccessMessage("bank", 2, 0)).toBe("Report downloaded (2 employee(s) skipped)")
    expect(exportSuccessMessage("reco", 3, 0)).toBe("Report downloaded (3 component(s) without GL setup)")
  })

  it("adds the no-head count, alone or merged with skipped (D-70)", () => {
    expect(exportSuccessMessage("reco", 0, 9)).toBe("Report downloaded (9 karyawan tanpa head dilewati)")
    expect(exportSuccessMessage("bank", 1, 9)).toBe("Report downloaded (1 employee(s) skipped; 9 karyawan tanpa head dilewati)")
  })
})

describe("shouldRetryRunQuery", () => {
  it("never retries a 4xx", () => {
    expect(shouldRetryRunQuery(0, new ApiError("bad", 400))).toBe(false)
    expect(shouldRetryRunQuery(0, new ApiError("nf", 404))).toBe(false)
  })

  it("retries 5xx and unknown errors up to 2 times", () => {
    expect(shouldRetryRunQuery(0, new ApiError("boom", 500))).toBe(true)
    expect(shouldRetryRunQuery(1, new Error("network"))).toBe(true)
    expect(shouldRetryRunQuery(2, new ApiError("boom", 503))).toBe(false)
  })
})
