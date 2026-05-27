"use client"

import { useState } from "react"
import { Check, CircleDashed, Clock, Loader2, MessageSquare, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  useAdvanceWorkflow,
  useRejectWorkflow,
  useWorkflowInstance,
} from "@/hooks/iam/use-workflow"
import {
  RESOLUTION_TYPE_LABEL,
  STEP_DECISION_BADGE,
  STEP_DECISION_LABEL,
  WORKFLOW_INSTANCE_STATUS_BADGE,
  WORKFLOW_INSTANCE_STATUS_LABEL,
  type WorkflowInstance,
  type WorkflowInstanceStep,
} from "@/types/iam/workflow"

interface WorkflowTimelineProps {
  instanceId: string
  // Optional: if true, hide Approve/Reject buttons (read-only view).
  readOnly?: boolean
  // Optional: invoked once after Advance/Reject succeeds AND the instance moves
  // to a terminal status (APPROVED, REJECTED, LOCKED, UNLOCKED). Use this to
  // synchronize the parent entity's own state — e.g. for CST_PRODUCT, auto-call
  // Finance.LockProduct after the last step is approved.
  onWorkflowCompleted?: (instance: WorkflowInstance) => void | Promise<void>
}

export function WorkflowTimeline({
  instanceId,
  readOnly = false,
  onWorkflowCompleted,
}: WorkflowTimelineProps) {
  const { data: instance, isLoading, isError, error } = useWorkflowInstance(instanceId)
  const advanceMut = useAdvanceWorkflow()
  const rejectMut = useRejectWorkflow()

  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null)
  const [comment, setComment] = useState("")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading workflow…
      </div>
    )
  }
  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        {error instanceof Error ? error.message : "Failed to load workflow"}
      </div>
    )
  }
  if (!instance) return null

  const isTerminal = instance.status !== "IN_PROGRESS"
  const currentStep = instance.steps.find((s) => s.stepNo === instance.currentStepNo)

  const openApprove = () => {
    setComment("")
    setActionMode("approve")
  }
  const openReject = () => {
    setComment("")
    setActionMode("reject")
  }

  const submitAction = async () => {
    if (!actionMode) return
    if (actionMode === "reject" && comment.trim() === "") return
    try {
      const updated =
        actionMode === "approve"
          ? await advanceMut.mutateAsync({ instanceId, comment: comment.trim() })
          : await rejectMut.mutateAsync({ instanceId, comment: comment.trim() })
      setActionMode(null)
      // Fire the side-effect callback exactly once when the instance reaches a terminal state.
      if (updated && updated.status !== "IN_PROGRESS" && onWorkflowCompleted) {
        await onWorkflowCompleted(updated)
      }
    } catch {
      // toast already handled
    }
  }

  const isPending = advanceMut.isPending || rejectMut.isPending

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Approval Workflow
              <Badge variant={WORKFLOW_INSTANCE_STATUS_BADGE[instance.status] || "secondary"}>
                {WORKFLOW_INSTANCE_STATUS_LABEL[instance.status] || instance.status}
              </Badge>
            </CardTitle>
            <CardDescription>
              {instance.kind} · template v{instance.templateVersion} · {instance.steps.length} step(s)
              {instance.startedBy && <> · started by {instance.startedBy}</>}
            </CardDescription>
          </div>
          {!readOnly && !isTerminal && currentStep && (
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="default" onClick={openApprove} disabled={isPending}>
                <Check className="mr-1 h-4 w-4" /> Approve
              </Button>
              {currentStep.approverResolutionType && (
                <Button size="sm" variant="destructive" onClick={openReject} disabled={isPending}>
                  <X className="mr-1 h-4 w-4" /> Reject
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ol className="space-y-4">
          {instance.steps.map((step) => (
            <StepRow
              key={step.instanceStepId}
              step={step}
              isCurrent={step.stepNo === instance.currentStepNo && !isTerminal}
            />
          ))}
        </ol>
      </CardContent>

      <Dialog open={actionMode !== null} onOpenChange={(open) => !open && setActionMode(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {actionMode === "approve" ? "Approve Current Step" : "Reject Workflow"}
            </DialogTitle>
            <DialogDescription>
              {actionMode === "approve"
                ? "Approving advances the workflow to the next step (or locks the entity if this is the last step). Comment is optional."
                : "Rejecting sets the workflow status to REJECTED. The comment is required and audited."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="workflow-comment">
              Comment {actionMode === "reject" && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="workflow-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={actionMode === "reject" ? "Reason for rejection (required)" : "Optional comment"}
              rows={4}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionMode(null)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant={actionMode === "reject" ? "destructive" : "default"}
              onClick={submitAction}
              disabled={isPending || (actionMode === "reject" && comment.trim() === "")}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {actionMode === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

interface StepRowProps {
  step: WorkflowInstanceStep
  isCurrent: boolean
}

function StepRow({ step, isCurrent }: StepRowProps) {
  const decision = step.decision || ""
  const decided = decision !== ""

  let Icon = CircleDashed
  let iconClass = "text-muted-foreground"
  if (decision === "APPROVED") {
    Icon = Check
    iconClass = "text-green-600"
  } else if (decision === "REJECTED") {
    Icon = X
    iconClass = "text-destructive"
  } else if (isCurrent) {
    Icon = Clock
    iconClass = "text-primary"
  }

  return (
    <li className="flex gap-3">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background",
          isCurrent && !decided && "border-primary",
        )}
      >
        <Icon className={cn("h-4 w-4", iconClass)} />
      </div>

      <div className="flex-1 space-y-1 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">
            #{step.stepNo} · {step.stepName}
          </span>
          <Badge variant={STEP_DECISION_BADGE[decision] || "outline"}>
            {STEP_DECISION_LABEL[decision] || "Pending"}
          </Badge>
          {isCurrent && !decided && <Badge variant="outline">Current</Badge>}
        </div>

        <p className="text-sm text-muted-foreground">
          Assigned via{" "}
          <span className="font-medium">
            {RESOLUTION_TYPE_LABEL[step.approverResolutionType] || step.approverResolutionType}
          </span>{" "}
          → <span className="font-mono">{step.approverResolutionValue}</span>
          {step.slaHours > 0 && <> · SLA {step.slaHours}h</>}
        </p>

        {decided && (
          <div className="space-y-1 text-sm">
            {step.actorUserId && (
              <p className="text-muted-foreground">
                Decided by <span className="font-mono">{step.actorUserId}</span>
                {step.decidedAt && <> on {new Date(step.decidedAt).toLocaleString()}</>}
              </p>
            )}
            {step.comment && (
              <p className="flex items-start gap-1 rounded-md bg-muted p-2 text-foreground">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{step.comment}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
