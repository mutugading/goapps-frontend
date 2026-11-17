/**
 * Payroll run & period UI (T030b): nominal formatting/masking, permission-gated period actions,
 * reopen reason validation.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

let perms: string[] = []
const reopenMutate = vi.fn().mockResolvedValue({})

vi.mock("next/link", () => ({ default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a> }))
vi.mock("@/lib/hooks/use-permission", () => ({
  usePermission: () => ({ hasPermission: (c: string) => perms.includes(c) }),
}))
vi.mock("@/hooks/payroll", () => ({
  useApprovePeriod: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useClosePeriod: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useReopenPeriod: () => ({ mutateAsync: reopenMutate, isPending: false }),
}))

import {
  PeriodActionDialog,
  PeriodsTable,
  RunLinesTable,
  RunsTable,
  allowedPeriodActions,
  formatNominal,
  formatYymm,
  parseYymm,
} from "@/components/payroll"
import type { Period, Run, RunLine } from "@/types/generated/payroll/v1/run"

const period = (over: Partial<Period>): Period => ({
  yymm: 202701, division: "SOLO", dateFrom: "2026-12-26", dateTo: "2027-01-25", status: "DRAFT",
  activeRunId: 7, approvedBy: "", approvedAt: "", closedBy: "", closedAt: "", reopenReason: "", ...over,
})

const run = (over: Partial<Run>): Run => ({
  runId: 7, yymm: 202701, division: "SOLO", processDate: "2027-01-26", status: "ACTIVE", employeeCount: 3,
  lineCount: 30, totalTunjangan: "12345678.50", totalPotongan: "1000", ruleSetId: 1, snapshotId: 2, nikFilter: [],
  warnings: [], startedBy: "u", startedAt: "2027-01-26T01:02:03Z", finishedAt: "", durationMs: 10, companyId: 1, ...over,
})

describe("payroll format helpers", () => {
  it("formats decimal strings without float conversion and keeps the mask", () => {
    expect(formatNominal("12345678.50")).toBe("12.345.678,50")
    expect(formatNominal("-1000")).toBe("-1.000")
    expect(formatNominal("***")).toBe("***")
    expect(formatNominal("")).toBe("-")
    expect(formatNominal("9007199254740993.01")).toBe("9.007.199.254.740.993,01")
  })
  it("formats and parses yymm", () => {
    expect(formatYymm(202701)).toBe("2027-01")
    expect(parseYymm("2027-01")).toBe(202701)
    expect(parseYymm("202713")).toBeUndefined()
    expect(parseYymm("2027")).toBeUndefined()
  })
  it("allows actions per status", () => {
    expect(allowedPeriodActions("OPEN")).toEqual([])
    expect(allowedPeriodActions("DRAFT")).toEqual(["approve"])
    expect(allowedPeriodActions("APPROVED")).toEqual(["close", "reopen"])
    expect(allowedPeriodActions("CLOSED")).toEqual(["reopen"])
  })
})

describe("runs & lines tables", () => {
  it("shows nominals and masked nominals", () => {
    render(<RunsTable data={[run({}), run({ runId: 8, totalTunjangan: "***", totalPotongan: "***" })]} />)
    expect(screen.getByText("12.345.678,50")).toBeTruthy()
    expect(screen.getAllByText("***").length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText("#7").closest("a")?.getAttribute("href")).toBe("/hr/payroll/runs/7")
  })
  it("renders lines with masked amount", () => {
    const line: RunLine = { nik: "100", compType: "T", compId: 1, description: "Gaji", amount: "***", base: "***", qty: "1", rate: "***", formula: "x", remarks: "" }
    render(<RunLinesTable data={[line]} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText("Gaji")).toBeTruthy()
    expect(screen.getAllByText("***").length).toBeGreaterThanOrEqual(1)
  })
})

describe("periods table permission gating", () => {
  beforeEach(() => { perms = [] })

  it("renders no action column without period.salary.* permissions", () => {
    render(<PeriodsTable data={[period({})]} onAction={vi.fn()} />)
    expect(screen.queryByRole("button", { name: /approve/i })).toBeNull()
  })

  it("shows approve only when permitted and calls onAction", () => {
    perms = ["payroll.period.salary.approve"]
    const onAction = vi.fn()
    render(<PeriodsTable data={[period({})]} onAction={onAction} />)
    const btn = screen.getByRole("button", { name: /approve/i })
    fireEvent.click(btn)
    expect(onAction).toHaveBeenCalledWith("approve", expect.objectContaining({ yymm: 202701 }))
    expect(screen.queryByRole("button", { name: /reopen/i })).toBeNull()
  })

  it("disables approve on an APPROVED period", () => {
    perms = ["payroll.period.salary.approve", "payroll.period.salary.close"]
    render(<PeriodsTable data={[period({ status: "APPROVED" })]} onAction={vi.fn()} />)
    expect((screen.getByRole("button", { name: /approve/i }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole("button", { name: /close/i }) as HTMLButtonElement).disabled).toBe(false)
  })
})

describe("reopen dialog", () => {
  beforeEach(() => reopenMutate.mockClear())

  it("blocks a reason shorter than 10 characters and submits a valid one", async () => {
    const onOpenChange = vi.fn()
    render(<PeriodActionDialog action="reopen" period={period({ status: "CLOSED" })} onOpenChange={onOpenChange} />)
    const box = screen.getByLabelText(/reason/i)
    fireEvent.change(box, { target: { value: "too short" } })
    expect(screen.getByRole("alert").textContent).toMatch(/at least 10/)
    fireEvent.click(screen.getByRole("button", { name: /^reopen$/i }))
    expect(reopenMutate).not.toHaveBeenCalled()

    fireEvent.change(box, { target: { value: "koreksi data absensi" } })
    fireEvent.click(screen.getByRole("button", { name: /^reopen$/i }))
    await vi.waitFor(() => expect(reopenMutate).toHaveBeenCalledWith({ yymm: 202701, division: "SOLO", reason: "koreksi data absensi" }))
  })
})
