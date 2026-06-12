"use client";

import { AlertTriangle } from "lucide-react";
import { type FillTask } from "@/types/finance/fill-assignment";

interface FillBlockerAlertProps {
  task: FillTask;
}

export function FillBlockerAlert({ task }: FillBlockerAlertProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
      <div>
        <p className="text-sm font-medium text-orange-800">
          Parameter fill required — Level {task.routeLevel}
        </p>
        <p className="mt-1 text-sm text-orange-700">
          You are assigned to fill parameters for routing level {task.routeLevel}.
          Progress: {task.filledParams}/{task.totalParams} parameters filled.
        </p>
      </div>
    </div>
  );
}
