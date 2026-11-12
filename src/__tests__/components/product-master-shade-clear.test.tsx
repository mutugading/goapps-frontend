import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const updateMutate = vi.fn().mockResolvedValue({})
vi.mock("@/hooks/finance/use-cost-product-master", () => ({
  useCreateCostProductMaster: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateCostProductMaster: () => ({ mutateAsync: updateMutate, isPending: false }),
}))
vi.mock("@/components/finance/comboboxes", () => ({ ProductTypeCombobox: () => null }))
vi.mock("@/components/finance/shade", () => ({
  ShadeCombobox: ({ code, onClear }: { code?: string; onClear?: () => void }) => (
    <div>
      <span data-testid="shade-code">{code}</span>
      <button type="button" onClick={onClear}>clear-shade</button>
    </div>
  ),
}))
import { ProductMasterFormDialog } from "@/components/finance/cost-product-master/product-master-form-dialog"

describe("ProductMasterFormDialog clear shade (P7-R6)", () => {
  beforeEach(() => updateMutate.mockClear())

  it("sends an empty shadeCode after clearing the shade", async () => {
    const user = userEvent.setup()
    const product = {
      productSysId: 5, productTypeId: 3, productName: "POY 75/72", shadeCode: "SC-1", shadeName: "Navy",
      gradeCode: "AX", description: "", flex01: "", flex02: "", flex03: "", isActive: true,
    }
    render(<ProductMasterFormDialog open onOpenChange={() => {}} product={product as never} />)
    expect(screen.getByTestId("shade-code")).toHaveTextContent("SC-1")
    await user.click(screen.getByText("clear-shade"))
    expect(screen.getByTestId("shade-code")).toHaveTextContent("")
    await user.click(screen.getByRole("button", { name: /update|save/i }))
    await waitFor(() => expect(updateMutate).toHaveBeenCalled())
    expect(updateMutate.mock.calls[0][0].shadeCode).toBe("")
  })
})
