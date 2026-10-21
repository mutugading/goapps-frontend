import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import BiDataTable from "@/components/bi/chart-engine/data-table"
import type { ChartDataResponse } from "@/types/bi"

const pt = (category: string, value: number) => ({
  category,
  value,
  label: String(value),
  meta: { name: "Ani", dept: "PRODUKSI" },
})

const data = {
  series: [
    { name: "HOURS", points: [pt("N1", 17)] },
    { name: "EXCESS", points: [pt("N1", 3)] },
    { name: "CHRONIC", points: [pt("N1", 2)] },
  ],
  categories: ["N1"],
  kpis: [],
  drillContext: { currentPath: [], canDrill: true, nextField: "", nextValues: [] },
} as unknown as ChartDataResponse

describe("BiDataTable employee_week", () => {
  it("renders NIK, name, dept and the three numeric columns", () => {
    render(<BiDataTable config={{ table_mode: "employee_week", number_format: "raw", decimals: 2 }} data={data} />)
    expect(screen.getByText("N1")).toBeTruthy()
    expect(screen.getByText("Ani")).toBeTruthy()
    expect(screen.getByText("PRODUKSI")).toBeTruthy()
    expect(screen.getByText("Minggu berturut-turut")).toBeTruthy()
  })

  it("keeps the generic table without table_mode", () => {
    render(<BiDataTable config={{}} data={data} />)
    expect(screen.getByText("Category")).toBeTruthy()
  })
})

const otPt = (category: string, value: number, group: string, division: string) => ({
  category,
  value,
  label: String(value),
  meta: { name: `Nama ${category}`, group, division, dept: "DEPT A" },
})

const otData = {
  series: [
    { name: "PERIOD_HOURS", points: [otPt("N1", 40, "DIV A", "DIV A"), otPt("N2", 10, "DIV A", "DIV A"), otPt("N3", 5, "DIV B", "DIV B")] },
    { name: "WEEK_HOURS", points: [otPt("N1", 17, "DIV A", "DIV A"), otPt("N2", 0, "DIV A", "DIV A"), otPt("N3", 12, "DIV B", "DIV B")] },
    { name: "EXCESS", points: [otPt("N1", 3, "DIV A", "DIV A"), otPt("N2", 0, "DIV A", "DIV A"), otPt("N3", 0, "DIV B", "DIV B")] },
    { name: "CHRONIC", points: [otPt("N1", 2, "DIV A", "DIV A"), otPt("N2", 0, "DIV A", "DIV A"), otPt("N3", 0, "DIV B", "DIV B")] },
  ],
  categories: ["N1", "N2", "N3"],
  kpis: [],
  drillContext: { currentPath: [], canDrill: true, nextField: "", nextValues: [] },
} as unknown as ChartDataResponse

const otConfig = {
  table_mode: "employee_ot",
  number_format: "raw",
  decimals: 2,
  employee_ot: {
    group_by: "DIVISION",
    group_options: ["DIVISION", "DEPT"],
    truncated: true,
    max_rows: 2000,
    subtotals: [
      { group: "DIV A", employees: 2, PERIOD_HOURS: 50, WEEK_HOURS: 17, EXCESS: 3 },
      { group: "DIV B", employees: 1, PERIOD_HOURS: 5, WEEK_HOURS: 12, EXCESS: 0 },
    ],
    ranges: {
      period_from: "2026-09-26", period_to: "2026-10-25", last_period_from: "2026-09-26", day_from: "2026-09-26",
      week_from: "2026-10-19", week_to: "2026-10-25", week_label: "2026-W43",
    },
  },
}

describe("BiDataTable employee_ot", () => {
  it("renders group subtotal rows, range headers and the truncated notice", () => {
    render(<BiDataTable config={otConfig} data={otData} />)
    expect(screen.getByText("Divisi: DIV A")).toBeTruthy()
    expect(screen.getByText("Divisi: DIV B")).toBeTruthy()
    expect(screen.getByText("50.00")).toBeTruthy() // DIV A period subtotal
    expect(screen.getByText("26 Sep 2026 – 25 Okt 2026")).toBeTruthy()
    expect(screen.getByText("2026-W43 · 19 Okt 2026 – 25 Okt 2026")).toBeTruthy()
    expect(screen.getByText(/Dibatasi 2000 karyawan/)).toBeTruthy()
  })

  it("keeps over-limit and chronic visible and filters to them", () => {
    render(<BiDataTable config={otConfig} data={otData} />)
    expect(screen.getByText("Total: 3 karyawan")).toBeTruthy()
    fireEvent.click(screen.getByRole("checkbox", { name: "Hanya melebihi 14 jam" }))
    expect(screen.getByText("Total: 1 karyawan")).toBeTruthy()
    expect(screen.getByText("N1")).toBeTruthy()
    expect(screen.queryByText("N2")).toBeNull()
    expect(screen.queryByText("Divisi: DIV B")).toBeNull()
  })

  it("drills NIK to days", () => {
    const onDrill = vi.fn()
    render(<BiDataTable config={otConfig} data={otData} onDrill={onDrill} />)
    fireEvent.click(screen.getByText("N3"))
    expect(onDrill).toHaveBeenCalledWith(["N3"])
  })

  it("renders the day drill with actual and limit hours", () => {
    const day = {
      series: [
        { name: "ACTUAL", points: [{ category: "2026-10-20", value: 4, label: "4" }] },
        { name: "LIMIT", points: [{ category: "2026-10-20", value: 3.5, label: "3.5" }] },
      ],
      categories: ["2026-10-20"],
      kpis: [],
      drillContext: { currentPath: ["N1"], canDrill: false, nextField: "", nextValues: [] },
    } as unknown as ChartDataResponse
    render(<BiDataTable config={{ table_mode: "employee_ot", number_format: "raw", decimals: 2 }} data={day} />)
    expect(screen.getByText("20 Okt 2026")).toBeTruthy()
    expect(screen.getByText("4.00")).toBeTruthy()
    expect(screen.getByText("3.50")).toBeTruthy()
  })
})
