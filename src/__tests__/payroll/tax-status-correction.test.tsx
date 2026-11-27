// T033n3: BFF routes (forwarding, validation, gRPC error mapping) + dialog + permission gating of the button.
import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import * as grpc from "@grpc/grpc-js"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const getEmployee = vi.fn()
const correctEmployeeTaxStatus = vi.fn()
const listEmployeeTaxHistory = vi.fn()

vi.mock("@/lib/grpc", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/grpc")>()
  return {
    ...actual,
    createMetadataFromRequest: () => ({ metadata: true }),
    getPayrollClient: () => ({ getEmployee, correctEmployeeTaxStatus, listEmployeeTaxHistory }),
  }
})

const hasPermission = vi.fn()
vi.mock("@/providers/permission-provider", () => ({ usePermissionContext: () => ({ hasPermission }) }))

const apiPost = vi.fn()
const apiGet = vi.fn()
vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>()
  return { ...actual, apiClient: { get: (...a: unknown[]) => apiGet(...a), post: (...a: unknown[]) => apiPost(...a) } }
})
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { ApiError } from "@/lib/api"
import { GET as getEmployeeRoute } from "@/app/api/v1/payroll/employees/[nik]/route"
import { GET as taxHistoryRoute } from "@/app/api/v1/payroll/employees/id/[id]/tax-history/route"
import { POST as correctRoute } from "@/app/api/v1/payroll/employees/id/[id]/tax-status-correction/route"
import { TaxHistoryTable, TaxStatusCorrectionDialog } from "@/components/payroll"
import EmployeeDetailClient from "@/app/(dashboard)/hr/payroll/employees/[nik]/employee-detail-client"
import type { Employee } from "@/types/generated/payroll/v1/master"

const BASE = "http://localhost:3000/api/v1/payroll"
const OK = { isSuccess: true, statusCode: "200", message: "OK", validationErrors: [] }
const grpcError = (code: number, details: string) =>
  Object.assign(new Error(details), { code, details, metadata: new grpc.Metadata() }) as grpc.ServiceError
const post = (body: unknown) =>
  new NextRequest(`${BASE}/employees/id/7/tax-status-correction`, { method: "POST", body: JSON.stringify(body) })
const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
const VALID = { taxId: "K1", validFrom: "2026-01-01", reason: "Wrong input", ifMatch: "etag-1" }

const EMP = { id: 7, nik: "MGT001", nama: "Budi", division: "SOLO", taxId: "TK", etag: "etag-1" } as Employee

const HIST = [
  { validFrom: "2026-03-01", taxId: "K1", source: "UPDATE", reason: "", createdBy: "hr.solo", createdAt: "2026-03-01T03:00:00Z" },
  { validFrom: "2026-01-01", taxId: "TK", source: "CORRECT", reason: "Wrong input", createdBy: "admin", createdAt: "2026-11-22T03:00:00Z" },
]

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("payroll employee BFF routes", () => {
  it("forwards the tax-status correction to gRPC", async () => {
    correctEmployeeTaxStatus.mockResolvedValue({ base: OK, data: { id: 7 } })
    const res = await correctRoute(post(VALID), ctx("7"))
    expect(res.status).toBe(200)
    expect(correctEmployeeTaxStatus.mock.calls[0][0]).toEqual({ id: 7, ...VALID })
  })

  it.each([
    ["taxId", { ...VALID, taxId: "" }],
    ["validFrom", { ...VALID, validFrom: "01/01/2026" }],
    ["reason", { ...VALID, reason: "  " }],
    ["ifMatch", { ...VALID, ifMatch: "" }],
  ])("rejects a missing/invalid %s with 400", async (_f, body) => {
    const res = await correctRoute(post(body), ctx("7"))
    expect(res.status).toBe(400)
    expect(correctEmployeeTaxStatus).not.toHaveBeenCalled()
  })

  it("rejects an invalid id with 400", async () => {
    expect((await correctRoute(post(VALID), ctx("abc"))).status).toBe(400)
  })

  it("maps PermissionDenied → 403 and AlreadyExists (PERIOD_CLOSED) → 409", async () => {
    correctEmployeeTaxStatus.mockRejectedValueOnce(grpcError(grpc.status.PERMISSION_DENIED, "permission denied"))
    expect((await correctRoute(post(VALID), ctx("7"))).status).toBe(403)
    correctEmployeeTaxStatus.mockRejectedValueOnce(grpcError(grpc.status.ALREADY_EXISTS, "PERIOD_CLOSED"))
    expect((await correctRoute(post(VALID), ctx("7"))).status).toBe(409)
  })

  it("lists the tax-status history by employee id", async () => {
    listEmployeeTaxHistory.mockResolvedValue({ base: OK, data: [HIST[0]] })
    const res = await taxHistoryRoute(new NextRequest(`${BASE}/employees/id/7/tax-history`), ctx("7"))
    expect(res.status).toBe(200)
    expect(listEmployeeTaxHistory.mock.calls[0][0]).toEqual({ id: 7 })
  })

  it("rejects an invalid history id with 400 and maps NotFound (out of scope) → 404", async () => {
    expect((await taxHistoryRoute(new NextRequest(`${BASE}/employees/id/x/tax-history`), ctx("x"))).status).toBe(400)
    expect(listEmployeeTaxHistory).not.toHaveBeenCalled()
    listEmployeeTaxHistory.mockRejectedValueOnce(grpcError(grpc.status.NOT_FOUND, "karyawan tidak ditemukan"))
    expect((await taxHistoryRoute(new NextRequest(`${BASE}/employees/id/7/tax-history`), ctx("7"))).status).toBe(404)
  })

  it("gets an employee by NIK forwarding division", async () => {
    getEmployee.mockResolvedValue({ base: OK, data: EMP })
    const res = await getEmployeeRoute(new NextRequest(`${BASE}/employees/MGT001?division=SOLO`), {
      params: Promise.resolve({ nik: "MGT001" }),
    })
    expect(res.status).toBe(200)
    expect(getEmployee.mock.calls[0][0]).toEqual({ nik: "MGT001", companyId: 0, division: "SOLO" })
  })
})

describe("TaxStatusCorrectionDialog", () => {
  it("blocks submit until date and reason are filled", async () => {
    const user = userEvent.setup()
    wrap(<TaxStatusCorrectionDialog employee={EMP} onOpenChange={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Correct" }))
    expect(await screen.findByText("Effective date is required")).toBeTruthy()
    expect(screen.getByText("Reason is required")).toBeTruthy()
    expect(apiPost).not.toHaveBeenCalled()
  })

  it("posts taxId, validFrom, reason and the employee etag as ifMatch", async () => {
    apiPost.mockResolvedValue({ base: OK, data: EMP })
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    wrap(<TaxStatusCorrectionDialog employee={EMP} onOpenChange={onOpenChange} />)
    const code = screen.getByLabelText(/Tax status code/)
    await user.clear(code)
    await user.type(code, "k1")
    await user.type(screen.getByLabelText("Effective from"), "2026-01-01")
    await user.type(screen.getByLabelText("Reason"), "Wrong input")
    await user.click(screen.getByRole("button", { name: "Correct" }))
    await waitFor(() => expect(apiPost).toHaveBeenCalled())
    expect(apiPost.mock.calls[0][0]).toBe("/api/v1/payroll/employees/id/7/tax-status-correction")
    expect(apiPost.mock.calls[0][1]).toEqual({ taxId: "K1", validFrom: "2026-01-01", reason: "Wrong input", ifMatch: "etag-1" })
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it("warns that HRIS must be corrected too", () => {
    wrap(<TaxStatusCorrectionDialog employee={EMP} onOpenChange={() => {}} />)
    expect(screen.getByText(/HRIS/)).toBeTruthy()
    expect(screen.getByText(/personal data/)).toBeTruthy()
  })
})

describe("employee detail permission gating", () => {
  beforeEach(() => apiGet.mockResolvedValue({ base: OK, data: EMP }))

  it("hides the correction button without payroll.master.taxstatus.update", async () => {
    hasPermission.mockReturnValue(false)
    wrap(<EmployeeDetailClient nik="MGT001" />)
    expect(await screen.findByText("Tax status")).toBeTruthy()
    expect(screen.queryByRole("button", { name: /Correct tax status/ })).toBeNull()
  })

  it("shows the button and opens the dialog for the permission holder", async () => {
    hasPermission.mockImplementation((c: string) => c === "payroll.master.taxstatus.update")
    const user = userEvent.setup()
    wrap(<EmployeeDetailClient nik="MGT001" />)
    await user.click(await screen.findByRole("button", { name: /Correct tax status/ }))
    expect(await screen.findByText("Correct Tax Status")).toBeTruthy()
  })
})

describe("TaxHistoryTable", () => {
  it("renders the rows newest first with source label, reason and actor", async () => {
    apiGet.mockResolvedValue({ base: OK, data: HIST })
    wrap(<TaxHistoryTable employeeId={7} />)
    expect(await screen.findByText("2026-03-01")).toBeTruthy()
    expect(apiGet.mock.calls[0][0]).toBe("/api/v1/payroll/employees/id/7/tax-history")
    const rows = screen.getAllByRole("row").slice(1)
    expect(rows).toHaveLength(2)
    expect(rows[0].textContent).toContain("K1")
    expect(rows[0].textContent).toContain("Status change")
    expect(rows[1].textContent).toContain("Correction")
    expect(rows[1].textContent).toContain("Wrong input")
    expect(rows[1].textContent).toContain("admin")
  })

  it("shows an empty state and an error message", async () => {
    apiGet.mockResolvedValueOnce({ base: OK, data: [] })
    const first = wrap(<TaxHistoryTable employeeId={7} />)
    expect(await screen.findByText("No tax-status history recorded.")).toBeTruthy()
    first.unmount()
    apiGet.mockRejectedValueOnce(new ApiError("forbidden", 403))
    wrap(<TaxHistoryTable employeeId={8} />)
    expect((await screen.findByRole("alert")).textContent).toContain("forbidden")
  })
})

describe("employee detail tax history", () => {
  it("shows the history in the Tax status card", async () => {
    hasPermission.mockReturnValue(false)
    apiGet.mockImplementation(async (url: string) =>
      url.endsWith("/tax-history") ? { base: OK, data: HIST } : { base: OK, data: EMP }
    )
    wrap(<EmployeeDetailClient nik="MGT001" />)
    expect(await screen.findByText("Wrong input")).toBeTruthy()
    expect(apiGet.mock.calls.some((c) => c[0] === "/api/v1/payroll/employees/id/7/tax-history")).toBe(true)
  })
})
