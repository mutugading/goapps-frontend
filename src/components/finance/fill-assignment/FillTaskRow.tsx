"use client";

import Link from "next/link";

import { type FillTask } from "@/types/finance/fill-assignment";
import { Button } from "@/components/ui/button";
import { FillTaskStatusBadge } from "./FillTaskStatusBadge";
import { FillTaskProgressBar } from "./FillTaskProgressBar";
import { UserName } from "@/components/common/user-name";
import { DeptName } from "@/components/common/dept-name";

interface FillTaskRowProps {
  task: FillTask;
  currentUserId: string;
  /** Whether the current user is a super-admin (bypasses all assignment checks). */
  isSuperAdmin?: boolean;
  /**
   * Department codes the current user belongs to (e.g. ["COSTING", "ENGINEERING"]).
   * Used to determine eligibility for DEPT-type tasks.
   */
  currentUserDepts?: string[];
  onClaim?: (taskId: number) => void;
  onApprove?: (taskId: number) => void;
  onReject?: (taskId: number) => void;
}

export function FillTaskRow({
  task,
  currentUserId,
  isSuperAdmin = false,
  currentUserDepts = [],
  onClaim,
  onApprove,
  onReject,
}: FillTaskRowProps) {
  const isActive = task.status === "FILL_TASK_STATUS_ACTIVE";
  const isFilling = task.status === "FILL_TASK_STATUS_FILLING";
  const isApprovalPending = task.status === "FILL_TASK_STATUS_APPROVAL_PENDING";

  const isUserFiller =
    task.fillerType === "FILL_ACTOR_TYPE_USER" &&
    task.fillerValue === currentUserId;
  const isDeptFiller =
    task.fillerType === "FILL_ACTOR_TYPE_DEPT" &&
    currentUserDepts.includes(task.fillerValue);

  const isUserApprover =
    task.approverType === "FILL_ACTOR_TYPE_USER" &&
    task.approverValue === currentUserId;
  const isDeptApprover =
    task.approverType === "FILL_ACTOR_TYPE_DEPT" &&
    currentUserDepts.includes(task.approverValue);

  const canClaim =
    isActive &&
    (isSuperAdmin || isUserFiller || isDeptFiller);

  const canSubmit =
    isFilling &&
    (isSuperAdmin || task.claimedBy === currentUserId);

  const canApproveReject =
    isApprovalPending &&
    (isSuperAdmin || isUserApprover || isDeptApprover);

  return (
    <tr className="border-b" data-testid={`fill-task-level-${task.routeLevel}`}>
      <td className="py-3 px-4 text-sm font-medium">Level {task.routeLevel}</td>
      <td className="py-3 px-4">
        <FillTaskStatusBadge status={task.status} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {task.fillerType === "FILL_ACTOR_TYPE_USER"
          ? <UserName userId={task.fillerValue} />
          : task.fillerType === "FILL_ACTOR_TYPE_DEPT"
            ? <DeptName deptCode={task.fillerValue} />
            : task.fillerValue || "—"}
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
          {canSubmit && (
            <Button size="sm" asChild>
              <Link href={`/finance/product-requests/${task.requestId}/fill/${task.taskId}`}>
                Fill Parameters
              </Link>
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
