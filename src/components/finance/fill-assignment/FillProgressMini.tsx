"use client";

import { useFillTasks } from "@/hooks/finance/use-fill-assignment";
import { FillTaskStatusBadge } from "./FillTaskStatusBadge";

interface Props {
  requestId: number;
}

export function FillProgressMini({ requestId }: Props) {
  const { data: tasks = [] } = useFillTasks(requestId);
  if (tasks.length === 0) return null;

  const approved = tasks.filter(
    (t) => t.status === "FILL_TASK_STATUS_APPROVED",
  ).length;
  const total = tasks.length;

  return (
    <div className="rounded-md border p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Fill Progress
      </p>
      <p className="text-sm font-medium">
        {approved}/{total} levels approved
      </p>
      <div className="mt-2 space-y-1">
        {tasks.map((t) => (
          <div
            key={t.taskId}
            className="flex items-center justify-between gap-2"
          >
            <span className="text-xs text-muted-foreground">
              Level {t.routeLevel}
            </span>
            <FillTaskStatusBadge status={t.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
