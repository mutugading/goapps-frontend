import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const validateMutate = vi.fn()
const previewData = {
  requiresConfirmation: true,
  candidates: [
    {
      oldSpinId: "s1", oldSpinCode: "SP-OLD", shadeCode: "SH1", fgProductId: 5, fgProductCode: "FG-1",
      oldHeadId: "h1", oldHeadCode: "HD-OLD", oldHeadWillDeactivate: true, oldMbProductSysId: 9,
      oldMbProductWillDeactivate: true, paramRowsPointer: 3, paramRowsTextOnly: 2, paramRowsTotal: 5,
      filledByCounts: [{ filledBy: "MB_SP_CODE", count: 5 }],
      affectedProducts: [{ productSysId: 1, productCode: "P-1", productName: "Prod", filledBy: "MB_SP_CODE" }],
      warnings: [],
    },
  ],
}

let previewState: Record<string, unknown> = { data: previewData, isLoading: false, isError: false }

vi.mock("@/hooks/finance/use-mb-head", () => ({
  useMBHeadSupersedePreview: () => previewState,
  useValidateMBHead: () => ({ mutate: validateMutate, isPending: false }),
}))
const mockHasPermission = vi.fn<(code: string) => boolean>(() => true)
vi.mock("@/providers/permission-provider", () => ({
  usePermissionContext: () => ({ hasPermission: mockHasPermission }),
}))

import { MbSupersedeConfirmDialog } from "@/components/finance/mb-recipe/mb-supersede-confirm-dialog"

describe("MbSupersedeConfirmDialog", () => {
  beforeEach(() => {
    validateMutate.mockReset()
    previewState = { data: previewData, isLoading: false, isError: false }
    mockHasPermission.mockImplementation(() => true)
  })

  it("shows repoint count with pointer + text-only breakdown", () => {
    render(<MbSupersedeConfirmDialog open mbhId="m1" onOpenChange={vi.fn()} />)
    expect(screen.getByText(/5 params will be repointed/)).toBeInTheDocument()
    expect(screen.getByTestId("repoint-count").textContent).toContain("3 pointer + 2 text-only")
  })

  it("cancel closes without sending a request", () => {
    const onOpenChange = vi.fn()
    render(<MbSupersedeConfirmDialog open mbhId="m1" onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(validateMutate).not.toHaveBeenCalled()
  })

  it("confirm validates with confirmSupersede true", () => {
    render(<MbSupersedeConfirmDialog open mbhId="m1" onOpenChange={vi.fn()} />)
    fireEvent.click(screen.getByRole("button", { name: /replace & validate/i }))
    expect(validateMutate).toHaveBeenCalledWith({ mbhId: "m1", confirmSupersede: true }, expect.anything())
  })

  it("confirm is disabled without finance.mb.head.validate", () => {
    mockHasPermission.mockImplementation((c) => c !== "finance.mb.head.validate")
    render(<MbSupersedeConfirmDialog open mbhId="m1" onOpenChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: /replace & validate/i })).toBeDisabled()
  })

  it("shows loading state while preview loads", () => {
    previewState = { data: undefined, isLoading: true, isError: false }
    render(<MbSupersedeConfirmDialog open mbhId="m1" onOpenChange={vi.fn()} />)
    expect(screen.getByText(/Loading preview/)).toBeInTheDocument()
  })

  it("shows error message when preview fails", () => {
    previewState = { data: undefined, isLoading: false, isError: true, error: new Error("boom preview") }
    render(<MbSupersedeConfirmDialog open mbhId="m1" onOpenChange={vi.fn()} />)
    expect(screen.getByText("boom preview")).toBeInTheDocument()
  })
})
