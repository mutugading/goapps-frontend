"use client";

import { type FillTask, fillTaskProgress } from "@/types/finance/fill-assignment";

interface FillTaskProgressBarProps {
  task: FillTask;
}

export function FillTaskProgressBar({ task }: FillTaskProgressBarProps) {
  const pct = fillTaskProgress(task);
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">
        {task.filledParams}/{task.totalParams}
      </span>
    </div>
  );
}
