"use client";

import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FillTrackingTable } from "./FillTrackingTable";
import {
  useApproveFillTask,
  useClaimFillTask,
  useFillTasks,
  useRejectFillTask,
  useSubmitFillTask,
} from "@/hooks/finance/use-fill-assignment";
import { useAuth } from "@/providers/auth-provider";
import { useDepartments } from "@/hooks/iam/use-departments";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: number;
  requestNo: string;
}

export function FillTrackingDrawer({ open, onOpenChange, requestId, requestNo }: Props) {
  const { user } = useAuth();
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-2xl sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Fill Tracking — {requestNo}</SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : (
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
