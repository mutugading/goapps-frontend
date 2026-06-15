"use client"

import Link from "next/link"
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  /** When false, Unlink is hidden regardless of other conditions (e.g. already confirmed/approved/released). */
  canUnlink?: boolean
}

export function RoutingPanel({ requestId, linkedRouteHeadId, readOnly = false, canUnlink = true }: Props) {
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
        <Card data-testid="routing-panel">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Routing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
          </CardContent>
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
      <Card>
        <CardContent className="flex items-center gap-2 pt-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading route…
        </CardContent>
      </Card>
    )
  }

  const head = graph.head
  const isShared = (linked?.length ?? 0) > 1
  return (
    <>
      <Card data-testid="routing-panel">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <CardTitle className="text-sm font-semibold">Routing</CardTitle>
          <Badge variant="outline" className="text-xs font-normal">
            {isShared ? "Shared" : "Own"} · {head.routingStatus}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
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
            {!readOnly && canUnlink && (
              <Button variant="ghost" size="sm" onClick={() => unlinkM.mutate({ requestId })}>
                Unlink
              </Button>
            )}
          </div>
        </CardContent>
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
