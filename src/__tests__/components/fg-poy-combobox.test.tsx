import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

const createMutateAsync = vi.fn()
const products = [
  { productTypeId: 9, productSysId: 1, productCode: "P-1", productName: "Poy One", shadeCode: "SH-1", erpItemCode: "OR1" },
  { productTypeId: 9, productSysId: 2, productCode: "P-2", productName: "Poy Two", shadeCode: "SH-2", erpItemCode: "" },
  { productTypeId: 9, productSysId: 3, productCode: "P-3", productName: "Poy NoShade", shadeCode: "", erpItemCode: "" },
]
const listSpy = vi.fn()
const typeItems: { typeId: number; typeCode: string; typeName: string }[] = [{ typeId: 9, typeCode: "POY", typeName: "POY" }]

vi.mock("@/hooks/finance/use-cost-product-master", () => ({
  useCostProductMasters: (params: unknown) => {
    listSpy(params)
    return { data: { items: products }, isLoading: false }
  },
  useCreateCostProductMaster: () => ({ mutateAsync: createMutateAsync, isPending: false }),
}))
vi.mock("@/hooks/finance/use-cost-product-type", () => ({
  useCostProductTypes: () => ({ data: { items: typeItems } }),
}))

import { FgPoyCombobox } from "@/components/finance/comboboxes/fg-poy-combobox"

beforeEach(() => {
  vi.clearAllMocks()
  // cmdk calls scrollIntoView, which jsdom lacks
  Element.prototype.scrollIntoView = vi.fn()
})

describe("FgPoyCombobox", () => {
  it("queries POY type only and filters by shade (keeps empty-shade products)", async () => {
    const user = userEvent.setup()
    render(<FgPoyCombobox shadeCode=" sh-1 " onChange={() => {}} />)
    await user.click(screen.getByRole("combobox"))
    expect(screen.getByText("Poy One")).toBeInTheDocument()
    expect(screen.getByText("Poy NoShade")).toBeInTheDocument()
    expect(screen.queryByText("Poy Two")).not.toBeInTheDocument()
    expect(listSpy).toHaveBeenCalledWith(expect.objectContaining({ productTypeIds: [9], activeFilter: "active" }))
  })

  it("requireShadeMatch hides blank-shade POYs", async () => {
    const user = userEvent.setup()
    render(<FgPoyCombobox shadeCode="SH-1" requireShadeMatch onChange={() => {}} />)
    await user.click(screen.getByRole("combobox"))
    expect(screen.getByText("Poy One")).toBeInTheDocument()
    expect(screen.queryByText("Poy NoShade")).not.toBeInTheDocument()
  })

  it("queries the shade server-side when a shade is given", () => {
    render(<FgPoyCombobox shadeCode="SH-1" onChange={() => {}} />)
    expect(listSpy).toHaveBeenCalledWith(expect.objectContaining({ shadeCode: "SH-1" }))
  })

  it("lists nothing when the POY type cannot be resolved", async () => {
    typeItems.length = 0
    const user = userEvent.setup()
    render(<FgPoyCombobox onChange={() => {}} />)
    await user.click(screen.getByRole("combobox"))
    expect(screen.queryByText("Poy One")).not.toBeInTheDocument()
    typeItems.push({ typeId: 9, typeCode: "POY", typeName: "POY" })
  })

  it("selecting an item calls onChange with the product", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FgPoyCombobox onChange={onChange} />)
    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByText("Poy Two"))
    expect(onChange).toHaveBeenCalledWith(2, expect.objectContaining({ productCode: "P-2", shadeCode: "SH-2" }))
  })

  it("create option opens the mini dialog and selects the new product", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    createMutateAsync.mockResolvedValue({
      productSysId: 55, productCode: "P-55", productName: "Brand New", erpItemCode: "ORX", shadeCode: "SH-1",
    })
    render(<FgPoyCombobox shadeCode="SH-1" allowCreate onChange={onChange} />)
    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByText(/\+ Create POY/))
    const name = await screen.findByLabelText("Name")
    await user.clear(name)
    await user.type(name, "Brand New")
    expect(screen.getByLabelText("Shade")).toHaveValue("SH-1")
    await user.type(screen.getByLabelText(/orion code/i), "ORX")
    await user.click(screen.getByRole("button", { name: /^create$/i }))
    await waitFor(() => expect(createMutateAsync).toHaveBeenCalledTimes(1))
    expect(createMutateAsync.mock.calls[0][0]).toMatchObject({
      productTypeId: 9, productName: "Brand New", shadeCode: "SH-1", gradeCode: "AX", erpItemCode: "ORX",
    })
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(55, expect.objectContaining({ productCode: "P-55" })))
  })

  it("hides the create option unless allowCreate", async () => {
    const user = userEvent.setup()
    render(<FgPoyCombobox onChange={() => {}} />)
    await user.click(screen.getByRole("combobox"))
    expect(screen.queryByText(/\+ Create POY/)).not.toBeInTheDocument()
  })

  it("create failure keeps dialog open and does not select", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    createMutateAsync.mockRejectedValue(new Error("fail"))
    render(<FgPoyCombobox shadeCode="SH-1" allowCreate onChange={onChange} />)
    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByText(/\+ Create POY/))
    const name = await screen.findByLabelText("Name")
    await user.clear(name)
    await user.type(name, "X")
    await user.click(screen.getByRole("button", { name: /^create$/i }))
    await waitFor(() => expect(createMutateAsync).toHaveBeenCalled())
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
  })
})
