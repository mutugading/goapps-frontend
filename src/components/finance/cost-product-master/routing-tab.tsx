"use client"

// RoutingTab — shows the cost route head bound to a product master (if any),
// with a link into the route editor. Replaces the old disabled "BOM / Routing"
// tab. BOM is intentionally out of scope (no mst_bom model yet).
import Link from "next/link"
import { ArrowUpRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/common/empty-state"
import { StatusBadge } from "@/components/common/status-badge"
import { useRouteByProduct } from "@/hooks/finance/use-cost-route"

interface Props {
  productSysId: number
}

export function ProductRoutingTab({ productSysId }: Props) {
  const { data: head, isLoading } = useRouteByProduct(productSysId)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading routing…
      </div>
    )
  }

  if (!head) {
    return (
      <EmptyState
        title="No routing defined"
        description="This product has no cost route yet. Routes are created from a product request or the routes page."
        action={
          <Button asChild variant="outline">
            <Link href="/finance/routes">Go to routes</Link>
          </Button>
        }
      />
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          Route #{head.headId}
          <StatusBadge status={head.routingStatus} type="route" size="sm" />
        </CardTitle>
        <Button asChild size="sm" variant="outline">
          <Link href={`/finance/routes/${head.headId}`}>
            Open route <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <Field label="Product" value={head.productCode || `#${productSysId}`} mono />
        <Field label="Name" value={head.productName || "—"} />
        <Field label="Version" value={`v${head.version}`} />
      </CardContent>
    </Card>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value}</div>
    </div>
  )
}
