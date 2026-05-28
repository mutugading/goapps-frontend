import { describe, it, expect } from "vitest"
import { resolvePeriod, periodLabel } from "@/lib/bi/period"

const now = new Date(2026, 4, 15) // May 15 2026 (month index 4)

describe("resolvePeriod", () => {
  it("L12M spans 12 months back to now", () => {
    const r = resolvePeriod("L12M", undefined, undefined, now)
    expect(r.from?.getFullYear()).toBe(2025)
    expect(r.from?.getMonth()).toBe(4) // May 2025
    expect(r.to).toEqual(now)
  })
  it("THIS_YEAR starts Jan 1", () => {
    const r = resolvePeriod("THIS_YEAR", undefined, undefined, now)
    expect(r.from?.getMonth()).toBe(0)
    expect(r.from?.getFullYear()).toBe(2026)
  })
  it("THIS_QTR snaps to quarter start (Apr for May)", () => {
    const r = resolvePeriod("THIS_QTR", undefined, undefined, now)
    expect(r.from?.getMonth()).toBe(3) // Q2 starts April
  })
  it("ALL returns null range", () => {
    const r = resolvePeriod("ALL", undefined, undefined, now)
    expect(r.from).toBeNull()
    expect(r.to).toBeNull()
  })
  it("CUSTOM uses provided dates", () => {
    const r = resolvePeriod("CUSTOM", "2026-01-01", "2026-03-31", now)
    expect(r.from).toEqual(new Date("2026-01-01"))
    expect(r.to).toEqual(new Date("2026-03-31"))
  })
})

describe("periodLabel", () => {
  it("formats YYYYMM monthly", () => {
    expect(periodLabel("202604", "MONTHLY")).toBe("Apr 2026")
  })
  it("passes through quarterly/yearly", () => {
    expect(periodLabel("2026-Q2", "QUARTERLY")).toBe("2026-Q2")
    expect(periodLabel("2026", "YEARLY")).toBe("2026")
  })
})
