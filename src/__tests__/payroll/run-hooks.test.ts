// Payroll run/period hook keys and request paths (T030a).
import { describe, it, expect, vi, beforeEach } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { payrollRunKeys, payrollPeriodKeys, periodActionPath, useExportPayrollReport } from "@/hooks/payroll/use-payroll-run"

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
