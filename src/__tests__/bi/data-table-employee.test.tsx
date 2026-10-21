import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
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
