"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CreateRoutingWizard } from "@/components/finance/cost-product-request/create-routing-wizard"
import { DuplicateRouteDialog } from "@/components/finance/cost-route/duplicate-route-dialog"
import { PickExistingRouteDialog } from "@/components/finance/cost-product-request/pick-existing-route-dialog"
import { useRouteGraph } from "@/hooks/finance/use-cost-route"
import { useLinkedRequests } from "@/hooks/finance/use-duplicate-route"
import { useLinkExistingRoute, useUnlinkRoute } from "@/hooks/finance/use-link-route"

interface Props {
  requestId: number
  linkedRouteHeadId?: number
  /** When true the request is terminal: routing is view-only (no link/create/unlink/duplicate). */
  readOnly?: boolean
}

export function RoutingPanel({ requestId, linkedRouteHeadId, readOnly = false }: Props) {
  const [pickOpen, setPickOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [dupOpen, setDupOpen] = useState(false)
  const linkM = useLinkExistingRoute()
  const unlinkM = useUnlinkRoute()
  const { data: graph, isLoading } = useRouteGraph(linkedRouteHeadId)
  const { data: linked } = useLinkedRequests(linkedRouteHeadId)

  // State C — nothing linked.
  if (!linkedRouteHeadId) {
    return (
      <>
        <Card className="space-y-3 p-4">
          <div className="font-semibold">Routing</div>
          {readOnly ? (
            <p className="text-sm text-muted-foreground">
              No routing was defined. The request is read-only.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                No routing defined yet. Choose how to build the cost basis:
              </p>
              <div className="grid gap-2 md:grid-cols-2">
                <Button variant="outline" onClick={() => setPickOpen(true)}>
                  📋 Pick existing product
                </Button>
                <Button variant="default" onClick={() => setWizardOpen(true)}>
                  🆕 Create new routing
                </Button>
              </div>
            </>
          )}
        </Card>
        <PickExistingRouteDialog
          open={pickOpen}
          onClose={() => setPickOpen(false)}
          onPick={(headId) => {
            linkM.mutate({ requestId, routeHeadId: headId })
            setPickOpen(false)
          }}
        />
        <CreateRoutingWizard
          open={wizardOpen}
          requestId={requestId}
          onClose={() => setWizardOpen(false)}
        />
      </>
    )
  }

  if (isLoading || !graph) {
    return (
      <Card className="p-4">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Loading route…
      </Card>
    )
  }

  const head = graph.head
  const isShared = (linked?.length ?? 0) > 1
  const isOwnFresh = head.routingStatus === "DRAFT"

  return (
    <>
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Routing</div>
          <Badge variant="outline">
            {isShared ? "Shared" : "Own"} · {head.routingStatus}
          </Badge>
        </div>
        <div className="space-y-1 rounded border bg-muted/20 p-3">
          <div className="font-mono text-sm">
            {head.productCode}
            {head.productName ? (
              <span className="text-muted-foreground"> — {head.productName}</span>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">
            Route #{head.headId} · v{head.version} · {graph.seqs.length} stages
          </div>
          {isShared && (
            <div className="text-xs">Shared by {linked?.length ?? 0} requests</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/finance/routes/${head.headId}?from=request:${requestId}`}>Open route ↗</Link>
          </Button>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={() => setDupOpen(true)}>
              Duplicate & adjust
            </Button>
          )}
          {!readOnly && !isOwnFresh && (
            <Button variant="ghost" size="sm" onClick={() => unlinkM.mutate({ requestId })}>
              Unlink
            </Button>
          )}
        </div>
      </Card>
      <DuplicateRouteDialog
        open={dupOpen}
        onClose={() => setDupOpen(false)}
        sourceHeadId={head.headId}
        sourceProductCode={head.productCode}
        linkedRequestId={requestId}
      />
    </>
  )
}
