"use client";

import {
  useFillTasks,
  useClaimFillTask,
  useSubmitFillTask,
  useApproveFillTask,
  useRejectFillTask,
} from "@/hooks/finance/use-fill-assignment";
import { useUser } from "@/providers/auth-provider";
import { FillTrackingTable } from "./FillTrackingTable";
import { FillBlockerAlert } from "./FillBlockerAlert";

interface Props {
  requestId: number;
}

export function FillTrackingTab({ requestId }: Props) {
  const user = useUser();
  const currentUserId = user?.userId ?? "";

  const { data: tasks = [], isLoading } = useFillTasks(requestId);
  const claim = useClaimFillTask(requestId);
  const submit = useSubmitFillTask(requestId);
  const approve = useApproveFillTask(requestId);
  const reject = useRejectFillTask(requestId);

  const myBlockerTask = tasks.find(
    (t) =>
      (t.status === "FILL_TASK_STATUS_ACTIVE" ||
        t.status === "FILL_TASK_STATUS_FILLING") &&
      t.fillerType === "FILL_ACTOR_TYPE_USER" &&
      t.fillerValue === currentUserId,
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
        onClaim={(taskId) => claim.mutate(taskId)}
        onSubmit={(taskId) => submit.mutate(taskId)}
        onApprove={(taskId) => approve.mutate({ taskId })}
        onReject={(taskId) => reject.mutate({ taskId, reason: "Rejected" })}
      />
    </div>
  );
}
