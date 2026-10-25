import { describe, it, expect } from "vitest"
import { readEmployeeOTBlock, localSubtotals, localSummary } from "@/lib/bi/employee-ot"

const row = (group: string, period: number, excess: number, chronic = 0) => ({
  __group: group, PERIOD_HOURS: period, WEEK_HOURS: 0, EXCESS: excess, CHRONIC: chronic,
})

describe("readEmployeeOTBlock (HD-24)", () => {
  it("reads summary and the new subtotal fields", () => {
    const b = readEmployeeOTBlock({
      employee_ot: {
        subtotals: [{ group: "A", employees: 2, PERIOD_HOURS: 30, avg_period_hours: 15, over_pct: 50 }],
        summary: { employees: 2, total_period_hours: 30, over_limit: 1, chronic: 1 },
      },
    })
    expect(b?.subtotals[0]).toMatchObject({ avg_period_hours: 15, over_pct: 50 })
    expect(b?.summary).toEqual({ employees: 2, totalPeriodHours: 30, overLimit: 1, chronic: 1 })
  })
  it("tolerates an older backend without summary", () => {
    const b = readEmployeeOTBlock({ employee_ot: { subtotals: [{ group: "A", employees: 1 }] } })
    expect(b?.summary).toBeUndefined()
    expect(b?.subtotals[0]).toMatchObject({ avg_period_hours: 0, over_pct: 0 })
  })
})

describe("localSubtotals", () => {
  it("computes avg and over_pct per group", () => {
    const s = localSubtotals([row("A", 10, 2), row("A", 21, 0), row("B", 5, 1)])
    expect(s).toHaveLength(2)
    expect(s[0]).toMatchObject({ group: "A", employees: 2, PERIOD_HOURS: 31, avg_period_hours: 15.5, over_pct: 50 })
    expect(s[1]).toMatchObject({ group: "B", avg_period_hours: 5, over_pct: 100 })
  })
  it("rounds half-up to 1 decimal", () => {
    const s = localSubtotals([row("A", 1, 0), row("A", 0, 0), row("A", 0, 0)])
    expect(s[0].avg_period_hours).toBe(0.3)
    expect(s[0].over_pct).toBe(0)
  })
  it("is empty for no rows", () => expect(localSubtotals([])).toEqual([]))
})

describe("localSummary", () => {
  it("counts per person", () => {
    expect(localSummary([row("", 10.04, 2, 3), row("", 5.02, 0, 0)])).toEqual({
      employees: 2, totalPeriodHours: 15.1, overLimit: 1, chronic: 1,
    })
  })
})
