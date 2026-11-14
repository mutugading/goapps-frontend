/**
 * Payroll run Diff tab (T030c2): summary + exclusions, masked nominals, against builder,
 * panel wiring of against/category/NIK filters to the hook.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"

const diffHook = vi.fn()
vi.mock("@/hooks/payroll", () => ({
  usePayrollRunDiff: (...args: unknown[]) => diffHook(...args),
}))

import { RunDiffPanel, RunDiffSummary, RunDiffTable, buildAgainst } from "@/components/payroll"
import type { RunDiff, RunDiffLine, RunDiffSummary as Summary } from "@/types/generated/payroll/v1/run"

const summary = (over: Partial<Summary> = {}): Summary => ({
  categories: { MATCH: 90, FORMULA: 3, ROUNDING: 2 },
  nikLegacy: 10, nikTarget: 10, headMismatch: 1,
  takeHomeLegacy: "1000000.00", takeHomeTarget: "1000500.00", takeHomeDelta: "500.00",
  parity: false,
  excluded: [{ reason: "D-47", nik: 2, lines: 4, otherLines: 0, headMismatch: 1, takeHomeLegacy: "1", takeHomeTarget: "2", takeHomeDelta: "1000" }],
  ...over,
})

const line = (over: Partial<RunDiffLine> = {}): RunDiffLine => ({
  nik: "100", component: "T001", legacyAmount: "1000", targetAmount: "1500", deltaAmount: "500", category: "FORMULA", ...over,
})

const diff = (over: Partial<RunDiff> = {}): RunDiff => ({
  runId: 7, against: "active", againstRunId: 6, yymm: 202701, division: "SOLO",
  summary: summary(), lines: [line()], heads: [], warnings: [], ...over,
})

const page = { currentPage: 1, pageSize: 50, totalItems: 1, totalPages: 1 }

describe("buildAgainst", () => {
  it("passes active/legacy and validates run ids", () => {
    expect(buildAgainst("active", "")).toBe("active")
    expect(buildAgainst("legacy", "x")).toBe("legacy")
    expect(buildAgainst("run", " 12 ")).toBe("run:12")
    expect(buildAgainst("run", "")).toBeUndefined()
    expect(buildAgainst("run", "0")).toBeUndefined()
    expect(buildAgainst("run", "1a")).toBeUndefined()
  })
})

describe("run diff components", () => {
  it("shows category counts, parity verdict and D-47/D-50 exclusions", () => {
    render(<RunDiffSummary summary={summary()} />)
    expect(screen.getByText("NOT PARITY")).toBeTruthy()
    expect(screen.getByText("FORMULA: 3")).toBeTruthy()
    expect(screen.getByText("MATCH: 90")).toBeTruthy()
    expect(screen.getByText("D-47")).toBeTruthy()
    expect(screen.getByText("1.000")).toBeTruthy()
  })
  it("renders PARITY and keeps masked nominals as ***", () => {
    render(<RunDiffSummary summary={summary({ parity: true, takeHomeDelta: "***", takeHomeLegacy: "***", takeHomeTarget: "***", excluded: [] })} />)
    expect(screen.getByText("PARITY")).toBeTruthy()
    expect(screen.getAllByText("***").length).toBe(3)
  })
  it("renders diff lines with delta, category and masked amounts", () => {
    render(
      <RunDiffTable
        data={[line(), line({ nik: "200", legacyAmount: "***", targetAmount: "***", deltaAmount: "***", category: "ROUNDING" }), line({ nik: "300", legacyAmount: "", category: "ONLY_TARGET" })]}
        pagination={page}
        onPageChange={vi.fn()}
        onPageSizeChange={vi.fn()}
      />
    )
    expect(screen.getAllByText("1.500").length).toBe(2)
    expect(screen.getByText("ROUNDING")).toBeTruthy()
    expect(screen.getAllByText("***").length).toBe(3)
    expect(screen.getByText("ONLY_TARGET")).toBeTruthy()
  })
})

describe("RunDiffPanel", () => {
  beforeEach(() => {
    diffHook.mockReset()
    diffHook.mockReturnValue({ data: { data: diff(), pagination: page }, isLoading: false, isError: false })
  })

  it("queries against active by default and shows summary and lines", () => {
    render(<RunDiffPanel runId={7} />)
    expect(diffHook).toHaveBeenCalledWith(7, expect.objectContaining({ against: "active", page: 1, pageSize: 50 }), true)
    expect(screen.getByText("FORMULA: 3")).toBeTruthy()
    expect(screen.getByText("1.500")).toBeTruthy()
    expect(screen.getByText(/Run #7 vs active \(#6\)/)).toBeTruthy()
  })
  it("shows server warnings and errors", () => {
    diffHook.mockReturnValue({ data: { data: diff({ warnings: ["W1 nik 100"] }), pagination: page }, isLoading: false, isError: false })
    const { unmount } = render(<RunDiffPanel runId={7} />)
    expect(screen.getByText("W1 nik 100")).toBeTruthy()
    unmount()
    diffHook.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error("boom") })
    render(<RunDiffPanel runId={7} />)
    expect(screen.getByRole("alert").textContent).toContain("boom")
  })
  it("passes the NIK filter to the hook (debounced)", async () => {
    vi.useFakeTimers()
    render(<RunDiffPanel runId={7} />)
    fireEvent.change(screen.getByLabelText("Filter diff by NIK"), { target: { value: " 100 " } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })
    vi.useRealTimers()
    expect(diffHook).toHaveBeenLastCalledWith(7, expect.objectContaining({ nik: "100", page: 1 }), true)
  })
})
