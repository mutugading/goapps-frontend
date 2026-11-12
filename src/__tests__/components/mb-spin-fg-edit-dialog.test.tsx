import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

const mutate = vi.fn()
vi.mock("@/hooks/finance/use-mb-spin", () => ({
  useUpdateMBSpinWithCascade: () => ({ mutate, isPending: false }),
}))
vi.mock("@/components/finance/comboboxes/fg-poy-combobox", () => ({
  FgPoyCombobox: ({
    value,
    shadeCode,
    onChange,
  }: {
    value?: number
    shadeCode?: string
    onChange: (id: number, p: unknown) => void
  }) => (
    <input
      data-testid="fg-input"
      data-shade={shadeCode ?? ""}
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value), {})}
    />
  ),
}))

import { MBSpinFgEditDialog } from "@/components/finance/mb-spin/mb-spin-fg-edit-dialog"
import type { MBSpin } from "@/types/finance/mb-spin"

const spin = (over: Record<string, unknown> = {}) =>
  ({ mbsId: "s1", mbsMbhId: "h1", mbsShadeCode: "SC-1", fgProductId: 0, ...over }) as unknown as MBSpin

describe("MBSpinFgEditDialog", () => {
  beforeEach(() => mutate.mockReset())

  it("passes the spin shade to the picker and disables Save until a FG is picked", () => {
    render(<MBSpinFgEditDialog open onOpenChange={vi.fn()} mbSpin={spin()} />)
    expect(screen.getByTestId("fg-input")).toHaveAttribute("data-shade", "SC-1")
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled()
    expect(screen.queryByRole("button", { name: "Remove FG link" })).not.toBeInTheDocument()
  })

  it("Save sends the picked fgProductId", () => {
    render(<MBSpinFgEditDialog open onOpenChange={vi.fn()} mbSpin={spin()} />)
    fireEvent.change(screen.getByTestId("fg-input"), { target: { value: "42" } })
    fireEvent.click(screen.getByRole("button", { name: "Save" }))
    expect(mutate.mock.calls[0][0]).toEqual({ mbhId: "h1", mbsId: "s1", fgProductId: 42 })
  })

  it("Remove FG link sends 0 when currently linked", () => {
    render(<MBSpinFgEditDialog open onOpenChange={vi.fn()} mbSpin={spin({ fgProductId: 7 })} />)
    fireEvent.click(screen.getByRole("button", { name: "Remove FG link" }))
    expect(mutate.mock.calls[0][0]).toEqual({ mbhId: "h1", mbsId: "s1", fgProductId: 0 })
  })

  it("Cancel closes without a request", () => {
    const onOpenChange = vi.fn()
    render(<MBSpinFgEditDialog open onOpenChange={onOpenChange} mbSpin={spin()} />)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mutate).not.toHaveBeenCalled()
  })
})
