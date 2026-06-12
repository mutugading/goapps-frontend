import { describe, it, expect } from "vitest"
import { chartRegistry, getChartRegistration, allChartTypes } from "@/lib/bi/chart-registry"

describe("chartRegistry", () => {
  it("has 15 chart types", () => {
    expect(Object.keys(chartRegistry)).toHaveLength(15)
    expect(allChartTypes()).toHaveLength(15)
  })

  it("waterfall is an ECharts chart with x/y required, drill-capable, no compare", () => {
    const reg = getChartRegistration("waterfall")
    expect(reg).toBeDefined()
    expect(reg!.lib).toBe("echarts")
    expect(reg!.requiredFields).toEqual(["x_axis_field", "y_axis_field"])
    expect(reg!.supportsDrill).toBe(true)
    expect(reg!.supportsCompare).toBe(false)
  })

  it("donut requires label+value", () => {
    const reg = getChartRegistration("donut")
    expect(reg!.requiredFields).toEqual(["label_field", "value_field"])
  })

  it("line is a shadcn chart that supports compare", () => {
    const reg = getChartRegistration("line")
    expect(reg!.lib).toBe("shadcn")
    expect(reg!.supportsCompare).toBe(true)
  })

  it("every registration carries a lazy Component and a label", () => {
    for (const reg of allChartTypes()) {
      expect(reg.Component).toBeTruthy()
      expect(reg.label.length).toBeGreaterThan(0)
    }
  })

  it("unknown type returns undefined", () => {
    expect(getChartRegistration("nope")).toBeUndefined()
  })
})
