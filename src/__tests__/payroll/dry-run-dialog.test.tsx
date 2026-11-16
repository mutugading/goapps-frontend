// T031c: Dry Run button (permission) + dialog (validation, result, warnings, masked nominals, errors).
import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"

const mutateAsync = vi.fn()
let perms: string[] = []
let mutation: { data?: unknown; isPending: boolean } = { isPending: false }
const toastError = vi.fn()

vi.mock("sonner", () => ({ toast: { error: (...a: unknown[]) => toastError(...a), success: vi.fn() } }))
vi.mock("@/lib/hooks/use-permission", () => ({
  usePermission: () => ({ hasPermission: (c: string) => perms.includes(c) }),
}))
vi.mock("@/hooks/payroll", () => ({
  useDryRunPayroll: () => ({ mutateAsync, ...mutation }),
  usePayrollRuns: () => ({ data: [], isLoading: false, isError: false, error: null }),
}))
vi.mock("@/lib/hooks", () => ({
  useUrlState: ({ defaultValues }: { defaultValues: unknown }) => [defaultValues, vi.fn()],
}))

import { DryRunDialog, MAX_DRY_RUN_NIK, PERM_RUN_DRY, parseNikList } from "@/components/payroll"
import RunsPageClient from "@/app/(dashboard)/hr/payroll/runs/runs-page-client"

beforeEach(() => {
  vi.clearAllMocks()
  perms = []
  mutation = { isPending: false }
})

describe("parseNikList", () => {
  it("splits on comma/space/newline and de-duplicates", () => {
    expect(parseNikList("1, 2\n3  2;4")).toEqual(["1", "2", "3", "4"])
    expect(parseNikList("  ")).toEqual([])
  })
})

describe("Runs page Dry Run button", () => {
  it("is hidden without payroll.run.dryrun.execute", () => {
    render(<RunsPageClient />)
    expect(screen.queryByRole("button", { name: /dry run/i })).toBeNull()
  })
  it("opens the dialog with the permission", () => {
    perms = [PERM_RUN_DRY]
    render(<RunsPageClient />)
    fireEvent.click(screen.getByRole("button", { name: /dry run/i }))
    expect(screen.getByText("Dry Run Payroll")).toBeTruthy()
  })
})

describe("DryRunDialog", () => {
  const open = () => render(<DryRunDialog open onOpenChange={() => {}} />)

  it("validates yymm and does not call the API", () => {
    open()
    fireEvent.change(screen.getByLabelText(/Period/), { target: { value: "202713" } })
    expect(screen.getByText(/Use yyyymm/)).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Run Dry Run" }))
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it("refuses more than the max NIKs", () => {
    open()
    fireEvent.change(screen.getByLabelText(/Period/), { target: { value: "202701" } })
    const many = Array.from({ length: MAX_DRY_RUN_NIK + 1 }, (_, i) => `N${i}`).join(",")
    fireEvent.change(screen.getByLabelText(/NIK list/), { target: { value: many } })
    expect(screen.getByText(/Too many NIKs/)).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Run Dry Run" }))
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it("submits yymm, division and parsed NIKs", async () => {
    mutateAsync.mockResolvedValue({})
    open()
    fireEvent.change(screen.getByLabelText(/Period/), { target: { value: "2027-01" } })
    fireEvent.change(screen.getByLabelText(/NIK list/), { target: { value: "A1, B2" } })
    fireEvent.click(screen.getByRole("button", { name: "Run Dry Run" }))
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ yymm: 202701, division: "SOLO", nik: ["A1", "B2"] }))
  })

  it("shows the backend message as a toast on error", async () => {
    mutateAsync.mockRejectedValue(new Error("MISSING_ATTENDANCE: snapshot kosong"))
    open()
    fireEvent.change(screen.getByLabelText(/Period/), { target: { value: "202701" } })
    fireEvent.click(screen.getByRole("button", { name: "Run Dry Run" }))
    await waitFor(() => expect(toastError).toHaveBeenCalledWith("MISSING_ATTENDANCE: snapshot kosong"))
  })

  it("renders summary, warnings, not-saved label and masked per-employee totals", () => {
    mutation = {
      isPending: false,
      data: {
        data: {
          runId: 0, yymm: 202701, division: "SOLO", status: "DRY", employeeCount: 2,
          totalTunjangan: "***", totalPotongan: "***", durationMs: 321, ruleSetId: 5,
          warnings: ["NIK 99 tanpa kontrak"],
        },
        employees: [
          { nik: "A1", name: "Budi", totalTunjangan: "***", totalPotongan: "***", takeHome: "***" },
          { nik: "B2", name: "Siti", totalTunjangan: "***", totalPotongan: "***", takeHome: "***" },
        ],
      },
    }
    open()
    expect(screen.getByText("Not saved")).toBeTruthy()
    expect(screen.getByText("NIK 99 tanpa kontrak")).toBeTruthy()
    expect(screen.getByText("321 ms")).toBeTruthy()
    expect(screen.getByText("Budi")).toBeTruthy()
    expect(screen.getAllByText("***").length).toBeGreaterThanOrEqual(8)
    expect(screen.queryByRole("link")).toBeNull()
  })
})
