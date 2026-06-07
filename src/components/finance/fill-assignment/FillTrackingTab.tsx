"use client";

import { useMemo } from "react";
import {
  useFillTasks,
  useClaimFillTask,
  useSubmitFillTask,
  useApproveFillTask,
  useRejectFillTask,
} from "@/hooks/finance/use-fill-assignment";
import { useUser } from "@/providers/auth-provider";
import { useDepartments } from "@/hooks/iam/use-departments";
import { FillTrackingTable } from "./FillTrackingTable";
import { FillBlockerAlert } from "./FillBlockerAlert";

interface Props {
  requestId: number;
}

export function FillTrackingTab({ requestId }: Props) {
  const user = useUser();
  const currentUserId = user?.userId ?? "";
  const isSuperAdmin = user?.roles?.includes("SUPER_ADMIN") ?? false;

  // Resolve user's department UUID → department code for DEPT-type task checks
  const { items: departments } = useDepartments();
  const currentUserDepts = useMemo(() => {
    const userDeptId = user?.departmentId;
    if (!userDeptId) return [];
    const dept = departments.find((d) => d.id === userDeptId);
    return dept ? [dept.code] : [];
  }, [user?.departmentId, departments]);

  const { data: tasks = [], isLoading } = useFillTasks(requestId);
  const claim = useClaimFillTask(requestId);
  const submit = useSubmitFillTask(requestId);
  const approve = useApproveFillTask(requestId);
  const reject = useRejectFillTask(requestId);

  const myBlockerTask = tasks.find(
    (t) =>
      (t.status === "FILL_TASK_STATUS_ACTIVE" ||
        t.status === "FILL_TASK_STATUS_FILLING") &&
      ((t.fillerType === "FILL_ACTOR_TYPE_USER" &&
        t.fillerValue === currentUserId) ||
        (t.fillerType === "FILL_ACTOR_TYPE_DEPT" &&
          currentUserDepts.includes(t.fillerValue))),
  );

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        Loading fill tasks...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {myBlockerTask && <FillBlockerAlert task={myBlockerTask} />}
      <FillTrackingTable
        tasks={tasks}
        currentUserId={currentUserId}
        isSuperAdmin={isSuperAdmin}
        currentUserDepts={currentUserDepts}
        onClaim={(taskId) => claim.mutate(taskId)}
        onSubmit={(taskId) => submit.mutate(taskId)}
        onApprove={(taskId) => approve.mutate({ taskId })}
        onReject={(taskId) => reject.mutate({ taskId, reason: "Rejected" })}
      />
    </div>
  );
}
