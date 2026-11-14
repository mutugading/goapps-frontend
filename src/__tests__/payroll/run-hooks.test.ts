// Payroll run/period hook keys and request paths (T030a).
import { describe, it, expect } from "vitest"
import { payrollRunKeys, payrollPeriodKeys, periodActionPath } from "@/hooks/payroll/use-payroll-run"

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
