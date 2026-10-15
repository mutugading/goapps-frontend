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
  it("THIS_WEEK snaps to Monday", () => {
    const r = resolvePeriod("THIS_WEEK", undefined, undefined, new Date(2026, 9, 15)) // Thu
    expect(r.from).toEqual(new Date(2026, 9, 12))
    expect(r.to).toEqual(new Date(2026, 9, 15))
  })
  it("LAST_WEEK is previous Mon–Sun", () => {
    const r = resolvePeriod("LAST_WEEK", undefined, undefined, new Date(2026, 9, 18)) // Sun
    expect(r.from).toEqual(new Date(2026, 9, 5))
    expect(r.to).toEqual(new Date(2026, 9, 11))
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

describe("resolvePeriod — payroll calendar 26–25 (HD-06)", () => {
  const pay = (preset: Parameters<typeof resolvePeriod>[0], grain: string, now: Date) =>
    resolvePeriod(preset, undefined, undefined, now, { calendar: "PAYROLL_26_25", grain })
  const ymd = (d: Date | null) => (d ? `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}` : null)

  it.each([
    ["tgl 24", new Date(2026, 9, 24), "2026-9-26", "2026-10-25"],
    ["tgl 25", new Date(2026, 9, 25), "2026-9-26", "2026-10-25"],
    ["tgl 26", new Date(2026, 9, 26), "2026-10-26", "2026-11-25"],
    ["31 Des", new Date(2026, 11, 31), "2026-12-26", "2027-1-25"],
  ])("THIS_MONTH MONTHLY %s", (_n, now, from, to) => {
    const r = pay("THIS_MONTH", "MONTHLY", now)
    expect([ymd(r.from), ymd(r.to)]).toEqual([from, to])
  })

  it("LAST_MONTH tgl 26 & 31 Des", () => {
    let r = pay("LAST_MONTH", "MONTHLY", new Date(2026, 9, 26))
    expect([ymd(r.from), ymd(r.to)]).toEqual(["2026-9-26", "2026-10-25"])
    r = pay("LAST_MONTH", "MONTHLY", new Date(2026, 11, 31))
    expect([ymd(r.from), ymd(r.to)]).toEqual(["2026-11-26", "2026-12-25"])
  })

  it("L12M includes the current period", () => {
    const r = pay("L12M", "MONTHLY", new Date(2026, 9, 24))
    expect([ymd(r.from), ymd(r.to)]).toEqual(["2025-10-26", "2026-10-25"])
  })

  it("WEEKLY: week crossing 25/26 follows the Sunday (K10)", () => {
    // Mon 20 Okt..Sun 26 Okt → masuk periode berjalan (26 Okt–25 Nov) saat now = 26 Okt
    const cur = pay("THIS_MONTH", "WEEKLY", new Date(2026, 9, 26))
    const mon = new Date(2026, 9, 20)
    expect(mon >= cur.from! && mon <= cur.to!).toBe(true)
    const prev = pay("LAST_MONTH", "WEEKLY", new Date(2026, 9, 26))
    expect(mon >= prev.from! && mon <= prev.to!).toBe(false)
  })

  it("WEEKLY reference is the Sunday of now's week (any weekday)", () => {
    // 23..29 Nov 2026 → Minggu 29 Nov → periode berakhir 25 Des → Senin ∈ [20 Nov, 19 Des]
    for (let day = 23; day <= 29; day++) {
      const r = pay("THIS_MONTH", "WEEKLY", new Date(2026, 10, day))
      expect([ymd(r.from), ymd(r.to)]).toEqual(["2026-11-20", "2026-12-19"])
    }
  })

  it("YESTERDAY & CALENDAR default unchanged", () => {
    const y = resolvePeriod("YESTERDAY", undefined, undefined, new Date(2027, 0, 1))
    expect(ymd(y.from)).toBe("2026-12-31")
    const m = resolvePeriod("LAST_MONTH", undefined, undefined, new Date(2026, 9, 26))
    expect([ymd(m.from), ymd(m.to)]).toEqual(["2026-9-1", "2026-9-30"])
  })
})
