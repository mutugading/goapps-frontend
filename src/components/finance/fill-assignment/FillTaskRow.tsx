"use client";

import { type FillTask } from "@/types/finance/fill-assignment";
import { Button } from "@/components/ui/button";
import { FillTaskStatusBadge } from "./FillTaskStatusBadge";
import { FillTaskProgressBar } from "./FillTaskProgressBar";

interface FillTaskRowProps {
  task: FillTask;
  currentUserId: string;
  onClaim?: (taskId: number) => void;
  onSubmit?: (taskId: number) => void;
  onApprove?: (taskId: number) => void;
  onReject?: (taskId: number) => void;
}

export function FillTaskRow({
  task,
  currentUserId,
  onClaim,
  onSubmit,
  onApprove,
  onReject,
}: FillTaskRowProps) {
  const canClaim =
    task.status === "FILL_TASK_STATUS_ACTIVE" &&
    task.fillerType === "FILL_ACTOR_TYPE_USER" &&
    task.fillerValue === currentUserId;

  const canSubmit =
    task.status === "FILL_TASK_STATUS_FILLING" &&
    task.claimedBy === currentUserId;

  const canApproveReject =
    task.status === "FILL_TASK_STATUS_APPROVAL_PENDING" &&
    task.approverType === "FILL_ACTOR_TYPE_USER" &&
    task.approverValue === currentUserId;

  return (
    <tr className="border-b">
      <td className="py-3 px-4 text-sm font-medium">Level {task.routeLevel}</td>
      <td className="py-3 px-4">
        <FillTaskStatusBadge status={task.status} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {task.fillerValue || "—"}
      </td>
      <td className="py-3 px-4 min-w-[160px]">
        <FillTaskProgressBar task={task} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {task.slaFillHours}h SLA
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          {canClaim && onClaim && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onClaim(task.taskId)}
            >
              Claim
            </Button>
          )}
          {canSubmit && onSubmit && (
            <Button size="sm" onClick={() => onSubmit(task.taskId)}>
              Submit
            </Button>
          )}
          {canApproveReject && (
            <>
              {onApprove && (
                <Button size="sm" onClick={() => onApprove(task.taskId)}>
                  Approve
                </Button>
              )}
              {onReject && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(task.taskId)}
                >
                  Reject
                </Button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
