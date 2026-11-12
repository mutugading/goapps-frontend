import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

import { MBSpinFilters } from "@/components/finance/mb-spin/mb-spin-filters"

describe("MBSpinFilters — Show superseded (P7-R4)", () => {
  it("toggling the switch sets includeSuperseded and resets to page 1", () => {
    const onFiltersChange = vi.fn()
    render(<MBSpinFilters filters={{ page: 3, pageSize: 10, includeSuperseded: false }} onFiltersChange={onFiltersChange} />)
    fireEvent.click(screen.getByRole("switch", { name: /show superseded/i }))
    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ includeSuperseded: true, page: 1 }))
  })
})
