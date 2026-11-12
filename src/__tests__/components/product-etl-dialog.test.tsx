import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@/__tests__/utils"
import userEvent from "@testing-library/user-event"

import { EtlError } from "@/services/finance/cost-product-master-mb-api"
import { ProductEtlDialog } from "@/components/finance/cost-product-master/product-etl-dialog"

const previewFn = vi.fn()
const applyFn = vi.fn()

vi.mock("@/hooks/finance/use-cost-product-master", () => ({
  usePreviewProductEtl: () => ({ mutateAsync: previewFn, isPending: false }),
  useApplyProductEtl: () => ({ mutateAsync: applyFn, isPending: false }),
}))

const row = (rowKey: string, status: string, selectable: boolean) => ({
  rowKey, mergeItemOrion: rowKey.split("|")[0], itemName: "Item " + rowKey, shadeCode: "S", shadeName: "",
  typeCode: "POY", status, selectable, matchedProductIds: [], denier: "", filament: "", note: "",
})
const counts = { exists: 1, existsMulti: 0, newShade: 1, newItem: 2, possibleDuplicate: 0, invalidType: 0, total: 4 }
const PREVIEW = (limit = 2) => ({
  runId: "run-1", fromDate: "2026-11-01", applyLimit: limit, counts,
  rows: [row("A|S", "NEW_ITEM", true), row("B|S", "NEW_SHADE", true), row("C|S", "NEW_ITEM", true), row("D|S", "EXISTS", false)],
})

async function openPreview() {
  const user = userEvent.setup()
  render(<ProductEtlDialog open onOpenChange={() => {}} />)
  await user.click(screen.getByRole("button", { name: "Preview" }))
  await screen.findByText("Item A|S")
  return user
}

describe("ProductEtlDialog", () => {
  beforeEach(() => { previewFn.mockReset(); applyFn.mockReset() })

  it("pre-checks nothing and disables non-selectable rows", async () => {
    previewFn.mockResolvedValue(PREVIEW())
    await openPreview()
    expect(screen.getByRole("checkbox", { name: "Select A|S" })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Select B|S" })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Select D|S" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled()
  })

  it("select-all respects applyLimit", async () => {
    previewFn.mockResolvedValue(PREVIEW(2))
    const user = await openPreview()
    await user.click(screen.getByRole("button", { name: "Select all selectable" }))
    expect(screen.getByTestId("etl-selected-count")).toHaveTextContent("2 / 2 selected")
    expect(screen.getByRole("checkbox", { name: "Select C|S" })).not.toBeChecked()
    await user.click(screen.getByRole("checkbox", { name: "Select C|S" }))
    expect(screen.getByTestId("etl-selected-count")).toHaveTextContent("2 / 2 selected")
    expect(screen.getByRole("button", { name: "Apply" })).toBeEnabled()
  })

  it("shows an inline alert on 503", async () => {
    previewFn.mockRejectedValue(new EtlError(503, "Oracle down"))
    const user = userEvent.setup()
    render(<ProductEtlDialog open onOpenChange={() => {}} />)
    await user.click(screen.getByRole("button", { name: "Preview" }))
    expect(await screen.findByText("Oracle ERP connection is not available")).toBeInTheDocument()
    expect(screen.getByText("Oracle down")).toBeInTheDocument()
  })

  it("applies selected rows and shows the summary", async () => {
    previewFn.mockResolvedValue(PREVIEW())
    applyFn.mockResolvedValue({
      runId: "run-1", inserted: 1, skipped: 0, failed: 0,
      rows: [{ rowKey: "A|S", result: "INSERTED", productSysId: 9, productCode: "CST9", message: "" }],
    })
    const user = await openPreview()
    await user.click(screen.getByRole("checkbox", { name: "Select A|S" }))
    await user.click(screen.getByRole("button", { name: "Apply" }))
    await user.click(screen.getByRole("button", { name: "Confirm apply" }))
    await waitFor(() => expect(applyFn).toHaveBeenCalledWith({ previewRunId: "run-1", rowKeys: ["A|S"] }))
    expect(await screen.findByTestId("etl-result")).toHaveTextContent("Inserted 1, skipped 0, failed 0")
    expect(screen.getByRole("link", { name: "CST9" })).toHaveAttribute("href", "/finance/product-master/9")
  })

  it("shows preview expired on 404 apply", async () => {
    previewFn.mockResolvedValue(PREVIEW())
    applyFn.mockRejectedValue(new EtlError(404, "run not found"))
    const user = await openPreview()
    await user.click(screen.getByRole("checkbox", { name: "Select A|S" }))
    await user.click(screen.getByRole("button", { name: "Apply" }))
    await user.click(screen.getByRole("button", { name: "Confirm apply" }))
    expect(await screen.findByText(/Preview expired, run preview again/)).toBeInTheDocument()
  })

  it("sends search and includeExisting toggle to preview", async () => {
    previewFn.mockResolvedValue(PREVIEW())
    const user = userEvent.setup()
    render(<ProductEtlDialog open onOpenChange={() => {}} />)
    await user.type(screen.getByLabelText("Search"), "abc")
    await user.click(screen.getByLabelText("Include existing"))
    await user.click(screen.getByRole("button", { name: "Preview" }))
    await waitFor(() => expect(previewFn).toHaveBeenCalled())
    expect(previewFn.mock.calls[0][0]).toMatchObject({ search: "abc", includeExisting: true })
  })
})
