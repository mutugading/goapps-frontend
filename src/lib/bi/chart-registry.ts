// FE chart registry — mirrors backend domain/bi/chart/registry.go. Maps a chart_type
// string to its rendering library, required/optional fields, drill/compare support,
// default config, and a lazy-loaded React component.
//
// ECharts components are lazy-imported so the ~heavy ECharts bundle only loads when a
// dashboard actually uses waterfall/heatmap/treemap/scatter/stacked/mixed.

import { lazy, type LazyExoticComponent, type ComponentType } from "react"
import type { ChartProps } from "@/components/bi/chart-engine/types"

export type ChartLib = "shadcn" | "echarts"

export interface ChartRegistration {
  type: string
  lib: ChartLib
  label: string
  requiredFields: string[]
  optionalFields: string[]
  supportsDrill: boolean
  supportsCompare: boolean
  defaultConfig: Record<string, unknown>
  Component: LazyExoticComponent<ComponentType<ChartProps>>
}

export const chartRegistry: Record<string, ChartRegistration> = {
  bar: {
    type: "bar",
    lib: "shadcn",
    label: "Bar Chart",
    requiredFields: ["x_axis_field", "y_axis_field"],
    optionalFields: ["color_field", "sort_order"],
    supportsDrill: true,
    supportsCompare: true,
    defaultConfig: { number_format: "thousands", decimals: 1, legend_position: "bottom" },
    Component: lazy(() => import("@/components/bi/chart-engine/shadcn/bar-chart")),
  },
  horizontal_bar: {
    type: "horizontal_bar",
    lib: "shadcn",
    label: "Horizontal Bar",
    requiredFields: ["x_axis_field", "y_axis_field"],
    optionalFields: ["sort_order"],
    supportsDrill: true,
    supportsCompare: true,
    defaultConfig: { number_format: "thousands", decimals: 1 },
    Component: lazy(() => import("@/components/bi/chart-engine/shadcn/horizontal-bar-chart")),
  },
  line: {
    type: "line",
    lib: "shadcn",
    label: "Line",
    requiredFields: ["x_axis_field", "y_axis_field"],
    optionalFields: ["smooth"],
    supportsDrill: false,
    supportsCompare: true,
    defaultConfig: { smooth: true, number_format: "thousands" },
    Component: lazy(() => import("@/components/bi/chart-engine/shadcn/line-chart")),
  },
  area: {
    type: "area",
    lib: "shadcn",
    label: "Area",
    requiredFields: ["x_axis_field", "y_axis_field"],
    optionalFields: ["smooth", "opacity"],
    supportsDrill: false,
    supportsCompare: true,
    defaultConfig: { smooth: true, opacity: 0.3, number_format: "thousands" },
    Component: lazy(() => import("@/components/bi/chart-engine/shadcn/area-chart")),
  },
  donut: {
    type: "donut",
    lib: "shadcn",
    label: "Donut",
    requiredFields: ["label_field", "value_field"],
    optionalFields: ["inner_radius", "label_position"],
    supportsDrill: true,
    supportsCompare: false,
    defaultConfig: { inner_radius: 0.4, legend_position: "right" },
    Component: lazy(() => import("@/components/bi/chart-engine/shadcn/donut-chart")),
  },
  kpi_card: {
    type: "kpi_card",
    lib: "shadcn",
    label: "KPI Card",
    requiredFields: ["value_field"],
    optionalFields: ["compare", "sparkline"],
    supportsDrill: false,
    supportsCompare: true,
    defaultConfig: { number_format: "currency_thousands" },
    Component: lazy(() => import("@/components/bi/chart-engine/shadcn/kpi-card")),
  },
  data_table: {
    type: "data_table",
    lib: "shadcn",
    label: "Data Table",
    requiredFields: [],
    optionalFields: ["columns", "sort", "paginate"],
    supportsDrill: false,
    supportsCompare: true,
    defaultConfig: { paginate: true },
    Component: lazy(() => import("@/components/bi/chart-engine/data-table")),
  },
  waterfall: {
    type: "waterfall",
    lib: "echarts",
    label: "Waterfall",
    requiredFields: ["x_axis_field", "y_axis_field"],
    optionalFields: ["positive_color", "negative_color", "total_color", "show_total_bar"],
    supportsDrill: true,
    supportsCompare: false,
    defaultConfig: {
      show_total_bar: true,
      positive_color: "#1d9e75",
      negative_color: "#a32d2d",
      total_color: "#534AB7",
      number_format: "currency_thousands",
      decimals: 1,
    },
    Component: lazy(() => import("@/components/bi/chart-engine/echarts/waterfall")),
  },
  stacked_bar: {
    type: "stacked_bar",
    lib: "echarts",
    label: "Stacked Bar",
    requiredFields: ["x_axis_field", "y_axis_field", "stack_by_field"],
    optionalFields: [],
    supportsDrill: true,
    supportsCompare: true,
    defaultConfig: { number_format: "thousands", legend_position: "bottom" },
    Component: lazy(() => import("@/components/bi/chart-engine/echarts/stacked-bar")),
  },
  treemap: {
    type: "treemap",
    lib: "echarts",
    label: "Treemap",
    requiredFields: ["label_field", "value_field"],
    optionalFields: ["parent_field"],
    supportsDrill: true,
    supportsCompare: false,
    defaultConfig: { number_format: "thousands" },
    Component: lazy(() => import("@/components/bi/chart-engine/echarts/treemap")),
  },
  heatmap: {
    type: "heatmap",
    lib: "echarts",
    label: "Heatmap",
    requiredFields: ["x_axis_field", "y_axis_field", "value_field"],
    optionalFields: ["color_scale"],
    supportsDrill: false,
    supportsCompare: false,
    defaultConfig: { color_scale: "viridis" },
    Component: lazy(() => import("@/components/bi/chart-engine/echarts/heatmap")),
  },
  scatter: {
    type: "scatter",
    lib: "echarts",
    label: "Scatter",
    requiredFields: ["x_axis_field", "y_axis_field"],
    optionalFields: ["size_field", "color_field"],
    supportsDrill: false,
    supportsCompare: false,
    defaultConfig: {},
    Component: lazy(() => import("@/components/bi/chart-engine/echarts/scatter")),
  },
  mixed: {
    type: "mixed",
    lib: "echarts",
    label: "Mixed (Bar + Line)",
    requiredFields: ["x_axis_field", "y_axis_field", "series_defs"],
    optionalFields: [],
    supportsDrill: false,
    supportsCompare: true,
    defaultConfig: { number_format: "thousands", legend_position: "bottom" },
    Component: lazy(() => import("@/components/bi/chart-engine/echarts/mixed")),
  },
}

/** Lookup with a typed fallback of undefined. */
export function getChartRegistration(type: string): ChartRegistration | undefined {
  return chartRegistry[type]
}

/** All chart types as an array, for the admin gallery. */
export function allChartTypes(): ChartRegistration[] {
  return Object.values(chartRegistry)
}
