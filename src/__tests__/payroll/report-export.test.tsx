// Payroll report export (T030d2): BFF route (bytes + Content-Disposition, validation, error mapping),
// permission/status gating of the period row actions, bank dialog (transfer date).
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import * as grpc from "@grpc/grpc-js"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

const exportReport = vi.fn()
const download = vi.fn()
let perms: string[] = []

vi.mock("@/lib/grpc", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/grpc")>()
  return { ...actual, createMetadataFromRequest: () => ({ metadata: true }), getPayrollClient: () => ({ exportReport }) }
})
vi.mock("@/lib/hooks/use-permission", () => ({
  usePermission: () => ({ hasPermission: (c: string) => perms.includes(c) }),
}))
vi.mock("@/hooks/payroll", () => ({
  useExportPayrollReport: () => ({ download, isDownloading: false }),
}))

import { GET as exportRoute } from "@/app/api/v1/payroll/reports/export/route"
import { BankExportDialog, PeriodsTable, canExportReport } from "@/components/payroll"
import type { Period } from "@/types/generated/payroll/v1/run"
import { ReportKind } from "@/types/generated/payroll/v1/report"
import { reportExportPath } from "@/hooks/payroll/use-payroll-run"

const BASE = "http://localhost:3000/api/v1/payroll/reports/export"
const OK = { isSuccess: true, statusCode: "200", message: "OK", validationErrors: [] }
const grpcError = (code: number, details: string) =>
  Object.assign(new Error(details), { code, details, metadata: new grpc.Metadata() }) as grpc.ServiceError

const period = (over: Partial<Period>): Period => ({
  yymm: 202701, division: "SOLO", dateFrom: "2026-12-26", dateTo: "2027-01-25", status: "DRAFT",
  activeRunId: 7, approvedBy: "", approvedAt: "", closedBy: "", closedAt: "", reopenReason: "", ...over,
})

beforeEach(() => {
  vi.clearAllMocks()
  perms = []
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("GET /payroll/reports/export", () => {
  it("relays xlsx bytes with Content-Disposition from file_name (bank)", async () => {
    exportReport.mockResolvedValue({
      base: OK, fileContent: new Uint8Array([80, 75, 3, 4]), fileName: "bank_SOLO_202701.xlsx", rowCount: 3, skippedCount: 1,
    })
    const res = await exportRoute(new NextRequest(`${BASE}?kind=bank&yymm=202701&division=SOLO&transferDate=2027-01-26`))
    expect(res.status).toBe(200)
    expect(exportReport.mock.calls[0][0]).toEqual({
      yymm: 202701, division: "SOLO", kind: ReportKind.REPORT_KIND_BANK, transferDate: "2027-01-26",
    })
    expect(res.headers.get("Content-Disposition")).toBe('attachment; filename="bank_SOLO_202701.xlsx"')
    expect(res.headers.get("Content-Type")).toContain("spreadsheetml")
    expect(res.headers.get("X-Skipped-Count")).toBe("1")
    expect(Array.from(new Uint8Array(await res.arrayBuffer()))).toEqual([80, 75, 3, 4])
  })

  it("reco ignores transferDate", async () => {
    exportReport.mockResolvedValue({ base: OK, fileContent: new Uint8Array([1]), fileName: "reco.xlsx", rowCount: 1, skippedCount: 0 })
    const res = await exportRoute(new NextRequest(`${BASE}?kind=reco&yymm=202701&division=SOLO&transferDate=2027-01-26`))
    expect(res.status).toBe(200)
    expect(exportReport.mock.calls[0][0]).toMatchObject({ kind: ReportKind.REPORT_KIND_RECO, transferDate: "" })
  })

  it("rejects bad input without calling gRPC", async () => {
    for (const q of [
      "kind=x&yymm=202701&division=SOLO",
      "kind=reco&division=SOLO",
      "kind=bank&yymm=202701&division=SOLO",
      "kind=bank&yymm=202701&division=SOLO&transferDate=26-01-2027",
    ]) {
      expect((await exportRoute(new NextRequest(`${BASE}?${q}`))).status).toBe(400)
    }
    expect(exportReport).not.toHaveBeenCalled()
  })

  it("maps gRPC PermissionDenied to 403", async () => {
    exportReport.mockRejectedValue(grpcError(grpc.status.PERMISSION_DENIED, "forbidden"))
    const res = await exportRoute(new NextRequest(`${BASE}?kind=reco&yymm=202701&division=SOLO`))
    expect(res.status).toBe(403)
  })

  it("builds the client path (transferDate only for bank)", () => {
    expect(reportExportPath({ kind: "reco", yymm: 202701, division: "SOLO", transferDate: "2027-01-26" })).not.toContain("transfer")
    expect(reportExportPath({ kind: "bank", yymm: 202701, division: "SOLO", transferDate: "2027-01-26" })).toContain("transfer_date=2027-01-26")
  })
})

describe("period export actions", () => {
  it("gates export by status and active run", () => {
    expect(canExportReport("reco", period({ status: "DRAFT" }))).toBe(true)
    expect(canExportReport("bank", period({ status: "DRAFT" }))).toBe(false)
    expect(canExportReport("bank", period({ status: "APPROVED" }))).toBe(true)
    expect(canExportReport("bank", period({ status: "CLOSED" }))).toBe(true)
    expect(canExportReport("reco", period({ activeRunId: 0 }))).toBe(false)
  })

  it("hides the download actions without both permissions", () => {
    perms = ["payroll.report.data.view"]
    render(<PeriodsTable data={[period({ status: "APPROVED" })]} onAction={vi.fn()} />)
    expect(screen.queryByRole("button", { name: /unduh reco/i })).toBeNull()
    expect(screen.queryByRole("button", { name: /unduh bank/i })).toBeNull()
  })

  it("shows the download actions and forwards the click with both permissions", () => {
    perms = ["payroll.report.data.view", "payroll.salary.amount.view"]
    const onAction = vi.fn()
    const p = period({ status: "APPROVED" })
    render(<PeriodsTable data={[p]} onAction={onAction} />)
    fireEvent.click(screen.getByRole("button", { name: /unduh bank/i }))
    expect((screen.getByRole("button", { name: /unduh reco/i }) as HTMLButtonElement).disabled).toBe(false)
    expect(onAction).toHaveBeenCalledWith("export-bank", p)
  })
})

describe("BankExportDialog", () => {
  it("requires a valid transfer date, then downloads bank", async () => {
    download.mockResolvedValue(true)
    const onOpenChange = vi.fn()
    render(<BankExportDialog period={period({ status: "APPROVED" })} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Download" }))
    expect(download).not.toHaveBeenCalled()
    fireEvent.change(screen.getByLabelText("Transfer date"), { target: { value: "2027-01-26" } })
    fireEvent.click(screen.getByRole("button", { name: "Download" }))
    await waitFor(() =>
      expect(download).toHaveBeenCalledWith({ kind: "bank", yymm: 202701, division: "SOLO", transferDate: "2027-01-26" })
    )
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })
})
