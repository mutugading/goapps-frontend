// Shared prop contract for every chart component. Kept in its own module so the
// registry and the engine can both import it without a circular dependency.

import type { ChartDataResponse } from "@/types/bi"

export interface ChartProps {
  /** chart_config map (already merged with registry defaults server-side). */
  config: Record<string, unknown>
  /** Shaped data payload from the backend. */
  data: ChartDataResponse
  /** Called when the user clicks a drillable element; receives the new full drill path. */
  onDrill?: (nextPath: string[]) => void
  /** Pixel height; defaults handled per component. */
  height?: number
}
