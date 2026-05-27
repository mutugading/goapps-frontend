import { describe, it, expect } from "vitest"
import { toRechartsRows, seriesNames, primarySeries, isEmpty, cfgStr, cfgNum, cfgBool } from "@/lib/bi/data-adapter"
import type { ChartDataResponse } from "@/types/bi"

function makeData(): ChartDataResponse {
  return {
    config: {},
    categories: ["Jan", "Feb"],
    series: [
      { name: "Net Profit", libHint: "", points: [
        { category: "Jan", value: 10, label: "10", meta: undefined },
        { category: "Feb", value: 20, label: "20", meta: undefined },
      ] },
      { name: "YoY Previous", libHint: "", points: [
        { category: "Jan", value: 8, label: "8", meta: undefined },
        // Feb missing → should default to 0 in pivot
      ] },
    ],
    kpis: [],
    drillContext: { currentPath: [], nextField: "", nextValues: [], canDrill: false },
    meta: undefined,
  } as unknown as ChartDataResponse
}

describe("toRechartsRows", () => {
  it("pivots series-major to row-major preserving category order", () => {
    const rows = toRechartsRows(makeData())
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ category: "Jan", "Net Profit": 10, "YoY Previous": 8 })
    expect(rows[1]).toMatchObject({ category: "Feb", "Net Profit": 20 })
    // Feb has no YoY Previous point → key absent (Recharts treats as gap)
    expect(rows[1]["YoY Previous"]).toBeUndefined()
  })
})

describe("seriesNames / primarySeries", () => {
  it("returns series names in order", () => {
    expect(seriesNames(makeData())).toEqual(["Net Profit", "YoY Previous"])
  })
  it("primarySeries returns the first", () => {
    expect(primarySeries(makeData())?.name).toBe("Net Profit")
  })
})

describe("isEmpty", () => {
  it("true for undefined", () => {
    expect(isEmpty(undefined)).toBe(true)
  })
  it("true when first series has no points", () => {
    const d = makeData()
    d.series[0].points = []
    expect(isEmpty(d)).toBe(true)
  })
  it("false when data present", () => {
    expect(isEmpty(makeData())).toBe(false)
  })
})

describe("cfg helpers", () => {
  const cfg = { a: "x", n: 5, b: true }
  it("cfgStr", () => {
    expect(cfgStr(cfg, "a")).toBe("x")
    expect(cfgStr(cfg, "missing", "def")).toBe("def")
  })
  it("cfgNum", () => {
    expect(cfgNum(cfg, "n")).toBe(5)
    expect(cfgNum(cfg, "missing", 9)).toBe(9)
  })
  it("cfgBool", () => {
    expect(cfgBool(cfg, "b")).toBe(true)
    expect(cfgBool(cfg, "missing", false)).toBe(false)
  })
})
