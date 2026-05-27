"use client"

// Live preview pane — debounced PreviewDashboard call rendered via ChartEngine.

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { usePreviewDashboard } from "@/hooks/bi/use-preview"
import { ChartEngine } from "@/components/bi/chart-engine/chart-engine"
import { ViewerEmptyState } from "@/components/bi/viewer/states"
import { chartTypeToString, type DashboardFormData, type ChartDataResponse } from "@/types/bi"
import { buildPreviewRequest } from "./build-request"

interface LivePreviewProps {
  form: DashboardFormData
  /** Required fields for the current chart type (to gate whether preview can run). */
  requiredFields: string[]
}

export function LivePreview({ form, requiredFields }: LivePreviewProps) {
  const preview = usePreviewDashboard()
  const [result, setResult] = useState<ChartDataResponse | undefined>()
  const debouncedForm = useDebounce(form, 500)

  const ready =
    form.filterType !== "" &&
    requiredFields.every((f) => {
      const v = form.chartConfig[f]
      return typeof v === "string" ? v.length > 0 : v !== undefined && v !== null
    })

  // `preview.mutateAsync` is stable from TanStack; we intentionally depend only on the
  // debounced form + readiness to avoid a refetch loop.
  useEffect(() => {
    if (!ready) {
      setResult(undefined)
      return
    }
    let cancelled = false
    preview
      .mutateAsync(buildPreviewRequest(debouncedForm))
      .then((r) => {
        if (!cancelled) setResult(r)
      })
      .catch(() => {
        if (!cancelled) setResult(undefined)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedForm, ready])

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Live Preview</CardTitle>
      </CardHeader>
      <CardContent>
        {!ready ? (
          <ViewerEmptyState message="Fill required fields to preview" />
        ) : preview.isPending && !result ? (
          <Skeleton className="h-[300px] w-full" />
        ) : result ? (
          <ChartEngine chartType={chartTypeToString(form.chartType)} config={form.chartConfig} data={result} height={300} />
        ) : (
          <ViewerEmptyState message="No preview data" />
        )}
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Preview uses real fact data (last 12 months)
        </p>
      </CardContent>
    </Card>
  )
}
