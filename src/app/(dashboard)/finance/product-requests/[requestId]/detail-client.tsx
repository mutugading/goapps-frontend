"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RequestDetailPanel,
  RequestFormDialog,
} from "@/components/finance/cost-product-request"
import {
  FillTrackingTab,
  FillProgressMini,
} from "@/components/finance/fill-assignment"
import { useCostProductRequest } from "@/hooks/finance/use-cost-product-request"

interface Props {
  requestId: string
}

// ProductRequestDetailClient renders a single product request at its own URL
// (/finance/product-requests/[id]). Replaces the previous inline-detail render
// that left the URL stuck at the list.
export default function ProductRequestDetailClient({ requestId }: Props) {
  const router = useRouter()
  const numericId = Number(requestId)
  const { data: request, isLoading } = useCostProductRequest(
    Number.isFinite(numericId) && numericId > 0 ? numericId : undefined,
  )
  const [formOpen, setFormOpen] = useState(false)

  function backToList() {
    router.push("/finance/product-requests")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading…" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Request">
          <Button variant="outline" onClick={backToList}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
          </Button>
        </PageHeader>
        <EmptyState
          title="Request not found"
          description={`No product request with id ${requestId}.`}
          action={<Button onClick={backToList}>Back to list</Button>}
        />
      </div>
    )
  }

  // Show the Fill Tracking tab for statuses where fill tasks may exist.
  const hasFillTracking =
    request.status === "PARAMETER_PENDING" ||
    request.status === "PARAMETER_COMPLETE" ||
    request.status === "UNDER_REVIEW" ||
    request.status === "CLOSED"

  return (
    <div className="space-y-6">
      <PageHeader title={request.requestNo} subtitle={request.title}>
        <Button variant="outline" onClick={backToList}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
      </PageHeader>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {hasFillTracking && (
            <TabsTrigger value="fill-tracking">Fill Tracking</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {hasFillTracking && (
            <div className="mb-4">
              <FillProgressMini requestId={request.requestId} />
            </div>
          )}
          <RequestDetailPanel request={request} onEdit={() => setFormOpen(true)} />
        </TabsContent>

        {hasFillTracking && (
          <TabsContent value="fill-tracking" className="mt-6">
            <FillTrackingTab requestId={request.requestId} />
          </TabsContent>
        )}
      </Tabs>

      <RequestFormDialog open={formOpen} onOpenChange={setFormOpen} request={request} />
    </div>
  )
}
