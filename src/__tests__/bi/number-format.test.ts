import { describe, it, expect } from "vitest"
import { formatNumber } from "@/lib/bi/number-format"

describe("formatNumber", () => {
  it("formats thousands", () => {
    expect(formatNumber(1234567, "thousands", 1)).toBe("1,234.6K")
  })
  it("formats millions", () => {
    expect(formatNumber(1234567, "millions", 1)).toBe("1.2M")
  })
  it("formats percent (fraction input)", () => {
    expect(formatNumber(0.187, "percent", 1)).toBe("18.7%")
  })
  it("formats currency thousands", () => {
    expect(formatNumber(1234567, "currency_thousands", 1)).toBe("$1,234.6K")
  })
  it("formats currency millions", () => {
    expect(formatNumber(1234567, "currency_millions", 1)).toBe("$1.2M")
  })
  it("wraps negatives in accounting brackets", () => {
    expect(formatNumber(-1000, "currency_thousands", 0)).toBe("($1K)")
    expect(formatNumber(-2500000, "currency_millions", 1)).toBe("($2.5M)")
  })
  it("formats raw with commas", () => {
    expect(formatNumber(1234.5, "raw", 2)).toBe("1,234.50")
  })
  it("clamps decimals to [0,6]", () => {
    expect(formatNumber(1234.5, "raw", 99)).toBe("1,234.500000")
    expect(formatNumber(1234.5, "raw", -5)).toBe("1,235") // toFixed(0) rounds
  })
  it("falls back to raw-style for unknown format", () => {
    expect(formatNumber(1000, "unknown", 0)).toBe("1,000")
  })
})
