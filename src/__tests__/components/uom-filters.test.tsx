// Tests for UOM Filters component
import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "../utils"
import { UOMFilters } from "@/components/finance/uom/uom-filters"
import { UOMCategory, ActiveFilter } from "@/types/finance/uom"

// Mock the UOM hooks
vi.mock("@/hooks/finance/use-uom", () => ({
  useExportUOMs: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

describe("UOMFilters Component", () => {
  const defaultFilters = {
    page: 1,
    pageSize: 10,
    search: "",
    category: UOMCategory.UOM_CATEGORY_UNSPECIFIED,
    activeFilter: ActiveFilter.ACTIVE_FILTER_UNSPECIFIED,
    sortBy: "code",
    sortOrder: "asc" as const,
  }

  const defaultProps = {
    filters: defaultFilters,
    onFiltersChange: vi.fn(),
  }

  it("should render search input", () => {
    render(<UOMFilters {...defaultProps} />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    expect(searchInput).toBeInTheDocument()
  })

  it("should call onFiltersChange when typing in search", () => {
    const onFiltersChange = vi.fn()
    render(<UOMFilters {...defaultProps} onFiltersChange={onFiltersChange} />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: "KG" } })

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "KG",
        page: 1,
      })
    )
  })

  it("should display current search value", () => {
    const filtersWithSearch = { ...defaultFilters, search: "test" }
    render(<UOMFilters filters={filtersWithSearch} onFiltersChange={vi.fn()} />)

    const searchInput = screen.getByPlaceholderText(/search/i) as HTMLInputElement
    expect(searchInput.value).toBe("test")
  })

  it("should render select dropdowns", () => {
    render(<UOMFilters {...defaultProps} />)

    // Should have multiple comboboxes (category, status, sort)
    const comboboxes = screen.getAllByRole("combobox")
    expect(comboboxes.length).toBeGreaterThanOrEqual(2)
  })
})
