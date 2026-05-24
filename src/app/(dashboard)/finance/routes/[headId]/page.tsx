"use client"

import { use } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { RouteGraphEditor } from "@/components/finance/cost-route/route-graph-editor"
import { useCostProductRequest } from "@/hooks/finance/use-cost-product-request"

export default function RouteDetailPage({
  params,
}: {
  params: Promise<{ headId: string }>
}) {
  const { headId } = use(params)
  return (
    <div className="space-y-3">
      <BackToRequestBar />
      <RouteGraphEditor headId={Number(headId)} />
    </div>
  )
}

// BackToRequestBar shows a sticky breadcrumb when the route was opened from a
// product request (?from=request:<id>), so the two screens feel like one flow.
function BackToRequestBar() {
  const params = useSearchParams()
  const from = params.get("from")
  const requestId = from?.startsWith("request:") ? Number(from.slice("request:".length)) : undefined
  const { data: request } = useCostProductRequest(
    requestId && Number.isFinite(requestId) ? requestId : undefined,
  )
  if (!requestId) return null
  return (
    <div className="sticky top-0 z-10 -mx-2 flex items-center gap-2 rounded-md border bg-background/95 px-3 py-2 text-sm backdrop-blur">
      <Link
        href={`/finance/product-requests/${requestId}`}
        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to request
      </Link>
      <span className="text-muted-foreground">
        / {request?.requestNo ?? `Request #${requestId}`}
        {request?.title ? ` · ${request.title}` : ""}
      </span>
    </div>
  )
}
