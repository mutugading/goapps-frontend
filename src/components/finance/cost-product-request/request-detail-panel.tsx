"use client"

// RequestDetailPanel — renders full request info + state-machine action buttons gated by status.
import { useState } from "react"
import {
  Ban,
  CheckCircle2,
  Edit,
  FileCheck,
  Inbox,
  Pencil,
  Play,
  RotateCcw,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CalculateButton } from "@/components/finance/calc-jobs/calculate-button"
import { UserName } from "@/components/common/user-name"
import { PaperTubeName } from "@/components/common/paper-tube-name"
import {
  AttachmentsPanel,
  CommentsPanel,
} from "@/components/finance/cost-request-comment"
import { RoutingPanel } from "./routing-panel"
import { StatusBadge } from "./status-badge"
import {
  CloseDialog,
  FeasibilityDialog,
  ReasonDialog,
  UseExistingCostingDialog,
  VerifyClassificationDialog,
} from "./transition-dialogs"
import {
  useCancelRequest,
  useDecideFeasibility,
  useMarkParameterComplete,
  useReviseRequest,
  useRejectRequest,
  useStartReview,
  useSubmitRequest,
  useUseExistingCosting,
  useVerifyClassification,
  useCloseRequest,
} from "@/hooks/finance/use-cost-product-request"
import type { CostProductRequest } from "@/types/finance/cost-product-request"

interface Props {
  request: CostProductRequest
  onEdit: () => void
}

type DialogKind = "reject" | "cancel" | "verify" | "feasibility" | "close" | "useExisting" | null

export function RequestDetailPanel({ request, onEdit }: Props) {
  const [dialog, setDialog] = useState<DialogKind>(null)

  const submitM = useSubmitRequest()
  const startM = useStartReview()
  const reviseM = useReviseRequest()
  const useExistingM = useUseExistingCosting()
  const verifyM = useVerifyClassification()
  const feasibilityM = useDecideFeasibility()
  const rejectM = useRejectRequest()
  const cancelM = useCancelRequest()
  const closeM = useCloseRequest()
  const markCompleteM = useMarkParameterComplete()

  const requestId = request.requestId
  const status = request.status

  const isDraft = status === "DRAFT"
  const isSubmitted = status === "SUBMITTED"
  const isUnderReview = status === "UNDER_REVIEW"
  const isParameterPending = status === "PARAMETER_PENDING"
  const isRejected = status === "REJECTED"
  const isTerminal = status === "CLOSED"

  return (
    <div className="space-y-6">
      {/* Action toolbar — gated by status */}
      <div className="flex flex-wrap items-center gap-2">
        {isDraft && (
          <>
            <Button onClick={onEdit} variant="outline">
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button onClick={() => submitM.mutate({ requestId })} disabled={submitM.isPending}>
              <Play className="mr-2 h-4 w-4" /> Submit
            </Button>
          </>
        )}
        {isSubmitted && (
          <Button onClick={() => startM.mutate({ requestId })} disabled={startM.isPending}>
            <Inbox className="mr-2 h-4 w-4" /> Start review
          </Button>
        )}
        {isUnderReview && (
          <>
            <Button variant="outline" onClick={() => setDialog("verify")}>
              <Edit className="mr-2 h-4 w-4" /> Verify classification
            </Button>
            <Button onClick={() => setDialog("feasibility")} disabled={feasibilityM.isPending}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Decide feasibility
            </Button>
            {request.verifiedClassification === "existing" && (
              <Button
                variant="secondary"
                onClick={() => setDialog("useExisting")}
                disabled={useExistingM.isPending}
              >
                <FileCheck className="mr-2 h-4 w-4" /> Use existing costing
              </Button>
            )}
            <Button variant="destructive" onClick={() => setDialog("reject")}>
              <XCircle className="mr-2 h-4 w-4" /> Reject
            </Button>
          </>
        )}
        {isParameterPending && (
          <Button
            onClick={() => markCompleteM.mutate({ requestId })}
            disabled={markCompleteM.isPending}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark parameters complete
          </Button>
        )}
        {isRejected && (
          <Button onClick={() => reviseM.mutate({ requestId })} disabled={reviseM.isPending}>
            <RotateCcw className="mr-2 h-4 w-4" /> Revise & resubmit
          </Button>
        )}
        {request.linkedRouteHeadId ? (
          <CalculateButton
            routeHeadId={request.linkedRouteHeadId}
            label="Calculate for linked route"
          />
        ) : null}
        {!isTerminal && (
          <>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => setDialog("close")}>
              Close
            </Button>
            <Button variant="ghost" onClick={() => setDialog("cancel")}>
              <Ban className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </>
        )}
      </div>

      {/* Header card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-mono">{request.requestNo}</div>
              <CardTitle>{request.title}</CardTitle>
            </div>
            <StatusBadge status={status} substatus={request.closedSubstatus} size="lg" />
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Field label="Type">{request.requestTypeCode ?? `#${request.requestTypeId}`}</Field>
          <Field label="Urgency">
            <span className="capitalize">{request.urgencyLevel}</span>
          </Field>
          <Field label="Classification">
            <span>{request.productClassification}</span>
            {request.verifiedClassification && request.verifiedClassification !== request.productClassification && (
              <span className="ml-2 text-orange-600 text-xs">→ {request.verifiedClassification}</span>
            )}
          </Field>
          <Field label="Needed by">{request.neededByDate || "—"}</Field>
          <Field label="Customer">{request.customerName}</Field>
          <Field label="Customer code">{request.customerCode || "—"}</Field>
          <Field label="Target volume">{request.targetVolume || "—"}</Field>
          <Field label="Target price">{request.targetPriceRange || "—"}</Field>
          <Field label="Requester"><UserName userId={request.requesterUserId} /></Field>
          <Field label="Assignee">{request.assignedToUserId ? <UserName userId={request.assignedToUserId} /> : "—"}</Field>
        </CardContent>
      </Card>

      {request.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.description}</p>
          </CardContent>
        </Card>
      )}

      {request.classificationOverrideReason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-orange-600">
              Classification override reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.classificationOverrideReason}</p>
          </CardContent>
        </Card>
      )}

      {request.feasibilityDecision && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Feasibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>
              Decision: <strong>{request.feasibilityDecision}</strong>
              {request.feasibilityBy && (
                <span className="ml-2 text-muted-foreground">
                  by <UserName userId={request.feasibilityBy} compact />
                  {request.feasibilityAt && (
                    <> · {new Date(request.feasibilityAt).toLocaleString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</>
                  )}
                </span>
              )}
            </div>
            {request.feasibilityNote && <p className="whitespace-pre-wrap">{request.feasibilityNote}</p>}
          </CardContent>
        </Card>
      )}

      {request.rejectReason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-destructive">Reject reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.rejectReason}</p>
          </CardContent>
        </Card>
      )}

      {request.cancelReason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Cancel reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.cancelReason}</p>
          </CardContent>
        </Card>
      )}

      {request.spec && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
              Product specification
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Field label="Raw material">{request.spec.rawMaterialType}</Field>
            <Field label="Paper tube"><PaperTubeName id={request.spec.paperTubeTypeId} /></Field>
            <Field label="Weight / bobbin">{request.spec.weightPerBobbinKg} kg</Field>
            <Field label="Box type">{request.spec.boxType}</Field>
            <Field label="Shade">{request.spec.shadeCustomText || `master #${request.spec.shadeId ?? "—"}`}</Field>
            <div className="col-span-2 md:col-span-4">
              <Separator className="my-2" />
              <Field label="Product description">
                <p className="whitespace-pre-wrap">{request.spec.productDescription}</p>
              </Field>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routing panel — 3 states: linked / own / nothing. */}
      <RoutingPanel
        requestId={request.requestId}
        linkedRouteHeadId={request.linkedRouteHeadId}
      />

      {/* Comments + attachments (Phase A §7.1.7–10) */}
      <AttachmentsPanel requestId={request.requestId} />
      <CommentsPanel requestId={request.requestId} />

      {/* Dialogs */}
      <ReasonDialog
        open={dialog === "reject"}
        onOpenChange={(o) => setDialog(o ? "reject" : null)}
        title="Reject request"
        description="Provide a reason — the requester can revise and re-submit."
        confirmLabel="Reject"
        pending={rejectM.isPending}
        onConfirm={(reason) => {
          rejectM.mutate({ requestId, body: { reason } }, { onSuccess: () => setDialog(null) })
        }}
      />
      <ReasonDialog
        open={dialog === "cancel"}
        onOpenChange={(o) => setDialog(o ? "cancel" : null)}
        title="Cancel request"
        description="Cancelling closes the request with sub-status = cancelled. Provide a reason."
        confirmLabel="Cancel request"
        pending={cancelM.isPending}
        onConfirm={(reason) => {
          cancelM.mutate({ requestId, body: { reason } }, { onSuccess: () => setDialog(null) })
        }}
      />
      <VerifyClassificationDialog
        open={dialog === "verify"}
        onOpenChange={(o) => setDialog(o ? "verify" : null)}
        currentClassification={request.productClassification}
        pending={verifyM.isPending}
        onConfirm={(verified, overrideReason) => {
          verifyM.mutate(
            { requestId, verifiedClassification: verified, overrideReason },
            { onSuccess: () => setDialog(null) },
          )
        }}
      />
      <FeasibilityDialog
        open={dialog === "feasibility"}
        onOpenChange={(o) => setDialog(o ? "feasibility" : null)}
        pending={feasibilityM.isPending}
        onConfirm={(decision, note) => {
          feasibilityM.mutate({ requestId, decision, note }, { onSuccess: () => setDialog(null) })
        }}
      />
      <UseExistingCostingDialog
        open={dialog === "useExisting"}
        onOpenChange={(o) => setDialog(o ? "useExisting" : null)}
        pending={useExistingM.isPending}
        onConfirm={(existingProductSysId) => {
          useExistingM.mutate(
            { requestId, body: { existingProductSysId } },
            { onSuccess: () => setDialog(null) },
          )
        }}
      />
      <CloseDialog
        open={dialog === "close"}
        onOpenChange={(o) => setDialog(o ? "close" : null)}
        pending={closeM.isPending}
        onConfirm={(substatus) => {
          closeM.mutate({ requestId, closedSubstatus: substatus }, { onSuccess: () => setDialog(null) })
        }}
      />
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  )
}
