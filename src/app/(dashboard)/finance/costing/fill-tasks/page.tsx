"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFillTasks, useClaimFillTask, useSubmitFillTask, useApproveFillTask, useRejectFillTask } from "@/hooks/finance/use-fill-assignment";
import { useUser } from "@/providers/auth-provider";
import { FillTrackingTable } from "@/components/finance/fill-assignment/FillTrackingTable";
import { FillBlockerAlert } from "@/components/finance/fill-assignment/FillBlockerAlert";
import { ClipboardList } from "lucide-react";

function FillTasksContent() {
  const searchParams = useSearchParams();
  const requestId = Number(searchParams.get("request_id") || 0);
  const requestNo = searchParams.get("request_no") || "";

  const user = useUser();
  const currentUserId = user?.userId ?? "";

  const { data: tasks = [], isLoading } = useFillTasks(requestId);
  const claim = useClaimFillTask(requestId);
  const submit = useSubmitFillTask(requestId);
  const approve = useApproveFillTask(requestId);
  const reject = useRejectFillTask(requestId);

  const myBlockerTask = tasks.find(
    (t) =>
      (t.status === "FILL_TASK_STATUS_ACTIVE" || t.status === "FILL_TASK_STATUS_FILLING") &&
      t.fillerType === "FILL_ACTOR_TYPE_USER" &&
      t.fillerValue === currentUserId,
  );

  if (!requestId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <ClipboardList className="h-12 w-12 text-muted-foreground/40" />
        <div>
          <p className="text-base font-medium text-muted-foreground">No request selected</p>
          <p className="text-sm text-muted-foreground mt-1">
            Open a product request and click the &quot;Track fill tasks&quot; button, or navigate here with{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">?request_id=…</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {myBlockerTask && <FillBlockerAlert task={myBlockerTask} />}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading fill tasks…</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No fill tasks found for this request.</p>
      ) : (
        <FillTrackingTable
          tasks={tasks}
          currentUserId={currentUserId}
          onClaim={(taskId) => claim.mutate(taskId)}
          onSubmit={(taskId) => submit.mutate(taskId)}
          onApprove={(taskId) => approve.mutate({ taskId })}
          onReject={(taskId) => reject.mutate({ taskId, reason: "Rejected" })}
        />
      )}
    </div>
  );
}

export default function FillTasksPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Fill Tasks</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Parameter fill tasks and approvals for costing requests.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <FillTasksContent />
      </Suspense>
    </div>
  );
}
