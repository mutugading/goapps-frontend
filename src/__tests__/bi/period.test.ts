import { describe, it, expect } from "vitest"
import { periodLabel, derivePeriodOptions } from "@/lib/bi/period"

describe("periodLabel", () => {
  it("formats YYYYMM monthly", () => {
    expect(periodLabel("202604", "MONTHLY")).toBe("Apr 2026")
  })
  it("keeps ISO week labels and derives them from dates", () => {
    expect(periodLabel("2026-W42", "WEEKLY")).toBe("2026-W42")
    expect(periodLabel("2026-10-15", "WEEKLY")).toBe("2026-W42")
    expect(periodLabel("2027-01-01", "WEEKLY")).toBe("2026-W53")
  })
  it("passes through quarterly/yearly", () => {
    expect(periodLabel("2026-Q2", "QUARTERLY")).toBe("2026-Q2")
    expect(periodLabel("2026", "YEARLY")).toBe("2026")
  })
})

describe("derivePeriodOptions", () => {
  const asOf = new Date(2026, 9, 30) // 30 Oct 2026 (local)

  it("excludes the current month by default (last complete month first)", () => {
    const opts = derivePeriodOptions(asOf, "L12M")
    expect(opts).toHaveLength(12)
    expect(opts[0]).toBe("202510")
    expect(opts[opts.length - 1]).toBe("202609")
  })
  it("includes the current month for workforce dashboards", () => {
    const opts = derivePeriodOptions(asOf, "L12M", true)
    expect(opts).toHaveLength(12)
    expect(opts[0]).toBe("202511")
    expect(opts[opts.length - 1]).toBe("202610")
  })
  it("returns 24 months for L24M and crosses year boundaries", () => {
    const opts = derivePeriodOptions(new Date(2026, 0, 15), "L24M", true)
    expect(opts).toHaveLength(24)
    expect(opts[0]).toBe("202402")
    expect(opts[opts.length - 1]).toBe("202601")
  })
  it("is oldest-first", () => {
    const opts = derivePeriodOptions(asOf, "L12M", true)
    expect([...opts].sort()).toEqual(opts)
  })
})
