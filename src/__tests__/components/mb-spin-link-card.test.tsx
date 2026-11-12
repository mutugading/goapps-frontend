import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@/__tests__/utils"
import userEvent from "@testing-library/user-event"

import { MbSpinLinkCard } from "@/components/finance/cost-product-master/mb-spin-link-card"

const perms = new Set<string>()
const relinkMutate = vi.fn()
let link: Record<string, unknown> = {}

vi.mock("@/providers/permission-provider", () => ({
  usePermissionContext: () => ({ hasPermission: (c: string) => perms.has(c) }),
}))
vi.mock("@/hooks/finance/use-cost-product-master", () => ({
  useCostProductMbLink: () => ({ data: link, isLoading: false }),
  useRelinkCostProductMb: () => ({ mutate: relinkMutate, isPending: false }),
}))

const base = {
  linkSource: "FG_MATCH", spinId: "s1", spinCode: "SP-001", spinShadeCode: "NL", fgProductId: 3,
  fgProductCode: "CSTPOY1", candidatePoyProductIds: [], reason: "", currentParamValue: "SP-001", paramMatches: true,
}

describe("MbSpinLinkCard", () => {
  beforeEach(() => { perms.clear(); relinkMutate.mockReset(); link = { ...base } })

  it("renders nothing without view permission", () => {
    const { container } = render(<MbSpinLinkCard productSysId={1} />)
    expect(container).toBeEmptyDOMElement()
  })

  it.each([
    ["FG_MATCH", "FG match"], ["SHADE_ONLY", "Shade only"], ["SUPERBA", "Superba"], ["NONE", "None"],
  ])("shows badge for %s", (src, label) => {
    perms.add("finance.product.route.view")
    link = { ...base, linkSource: src }
    render(<MbSpinLinkCard productSysId={1} />)
    expect(screen.getByTestId("mb-link-source")).toHaveTextContent(label)
  })

  it("warns when paramMatches is false", () => {
    perms.add("finance.product.route.view")
    link = { ...base, paramMatches: false }
    render(<MbSpinLinkCard productSysId={1} />)
    expect(screen.getByRole("alert")).toHaveTextContent(/does not match/i)
  })

  it("hides Re-link without update permission", () => {
    perms.add("finance.product.route.view")
    render(<MbSpinLinkCard productSysId={1} />)
    expect(screen.queryByRole("button", { name: /Re-link MB/ })).toBeNull()
  })

  it("re-links after confirm with update permission", async () => {
    perms.add("finance.product.route.view"); perms.add("finance.product.route.update")
    const user = userEvent.setup()
    render(<MbSpinLinkCard productSysId={7} />)
    await user.click(screen.getByRole("button", { name: /Re-link MB/ }))
    await user.click(screen.getByRole("button", { name: "Re-link" }))
    expect(relinkMutate).toHaveBeenCalledWith(7)
  })

  it("NONE state shows reason and no param mismatch warning", () => {
    perms.add("finance.product.route.view")
    link = { ...base, linkSource: "NONE", paramMatches: false, reason: "no spin found" }
    render(<MbSpinLinkCard productSysId={1} />)
    expect(screen.getByText("no spin found")).toBeInTheDocument()
    expect(screen.queryByRole("alert")).toBeNull()
  })
})
