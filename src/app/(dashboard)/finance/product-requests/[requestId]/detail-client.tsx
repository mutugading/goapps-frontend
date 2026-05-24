"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { EmptyState } from "@/components/common/empty-state"
import { Button } from "@/components/ui/button"
import {
  RequestDetailPanel,
  RequestFormDialog,
} from "@/components/finance/cost-product-request"
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

  return (
    <div className="space-y-6">
      <PageHeader title={request.requestNo} subtitle={request.title}>
        <Button variant="outline" onClick={backToList}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
        </Button>
      </PageHeader>
      <RequestDetailPanel request={request} onEdit={() => setFormOpen(true)} />
      <RequestFormDialog open={formOpen} onOpenChange={setFormOpen} request={request} />
    </div>
  )
}
