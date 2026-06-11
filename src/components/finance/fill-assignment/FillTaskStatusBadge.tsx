"use client";

import {
  type FillTaskStatus,
  fillTaskStatusLabel,
} from "@/types/finance/fill-assignment";

const STATUS_COLORS: Record<FillTaskStatus, string> = {
  FILL_TASK_STATUS_INACTIVE: "bg-gray-100 text-gray-500",
  FILL_TASK_STATUS_ACTIVE: "bg-blue-100 text-blue-800",
  FILL_TASK_STATUS_FILLING: "bg-yellow-100 text-yellow-800",
  FILL_TASK_STATUS_FILLED: "bg-indigo-100 text-indigo-800",
  FILL_TASK_STATUS_APPROVAL_PENDING: "bg-orange-100 text-orange-800",
  FILL_TASK_STATUS_APPROVED: "bg-green-100 text-green-800",
  FILL_TASK_STATUS_REJECTED: "bg-red-100 text-red-800",
};

interface FillTaskStatusBadgeProps {
  status: FillTaskStatus | string;
}

export function FillTaskStatusBadge({ status }: FillTaskStatusBadgeProps) {
  const color =
    STATUS_COLORS[status as FillTaskStatus] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      data-testid="task-status"
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {fillTaskStatusLabel(status)}
    </span>
  );
}
