"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpsertFillConfig } from "@/hooks/finance/use-fill-assignment";
import { type LevelAssignmentConfig } from "@/types/finance/fill-assignment";
import { useDepartments } from "@/hooks/iam/use-departments";
import { useUsersLookup } from "@/hooks/iam/use-users-lookup";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: LevelAssignmentConfig;
  /** When provided, saves as a PRODUCT-tier override. */
  productSysId?: number;
  tier?: "GLOBAL" | "PRODUCT" | "REQUEST";
}

export function FillConfigForm({
  open,
  onOpenChange,
  existing,
  productSysId,
  tier = "GLOBAL",
}: Props) {
  const [routeLevel, setRouteLevel] = useState(existing?.routeLevel ?? 1);
  const [fillerType, setFillerType] = useState(
    existing?.fillerType ?? "DEPT",
  );
  const [fillerValue, setFillerValue] = useState(
    existing?.fillerValue ?? "",
  );
  const [approverType, setApproverType] = useState(
    existing?.approverType || "NONE",
  );
  const [approverValue, setApproverValue] = useState(
    existing?.approverValue ?? "",
  );
  const [slaFillHours, setSlaFillHours] = useState(
    existing?.slaFillHours ?? 48,
  );
  const [slaApproveHours, setSlaApproveHours] = useState(
    existing?.slaApproveHours ?? 24,
  );

  const { items: departments, isLoading: deptsLoading } = useDepartments();
  const { items: users, isLoading: usersLoading } = useUsersLookup();

  const upsert = useUpsertFillConfig();

  function handleFillerTypeChange(value: string) {
    setFillerType(value);
    setFillerValue(""); // reset value when type changes
  }

  function handleApproverTypeChange(value: string) {
    setApproverType(value);
    setApproverValue(""); // reset value when type changes
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    upsert.mutate(
      {
        tier: productSysId ? "PRODUCT" : tier,
        routeLevel,
        fillerType,
        fillerValue,
        approverType:
          approverType === "NONE" ? undefined : approverType || undefined,
        approverValue: approverValue || undefined,
        slaFillHours,
        slaApproveHours,
        productSysId: productSysId ?? undefined,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const effectiveTier = productSysId ? "PRODUCT" : tier;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existing ? "Edit" : "Add"} Level Config
            {effectiveTier !== "GLOBAL" && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({effectiveTier})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Route Level</Label>
              <Input
                type="number"
                min={1}
                value={routeLevel}
                onChange={(e) => setRouteLevel(Number(e.target.value))}
                disabled={!!existing}
              />
            </div>
            <div>
              <Label>SLA Fill (hours)</Label>
              <Input
                type="number"
                min={1}
                value={slaFillHours}
                onChange={(e) => setSlaFillHours(Number(e.target.value))}
              />
            </div>

            {/* Filler Type */}
            <div>
              <Label>Filler Type</Label>
              <Select value={fillerType} onValueChange={handleFillerTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="DEPT">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filler Value — dropdown based on type */}
            <div>
              <Label>Filler Value</Label>
              {fillerType === "DEPT" ? (
                <Select value={fillerValue} onValueChange={setFillerValue}>
                  <SelectTrigger>
                    <SelectValue placeholder={deptsLoading ? "Loading…" : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.code}>
                        {d.code} — {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={fillerValue} onValueChange={setFillerValue}>
                  <SelectTrigger>
                    <SelectValue placeholder={usersLoading ? "Loading…" : "Select user"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.username || u.fullName || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Approver Type */}
            <div>
              <Label>Approver Type (optional)</Label>
              <Select
                value={approverType}
                onValueChange={handleApproverTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="DEPT">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Approver Value — dropdown based on type */}
            <div>
              <Label>Approver Value</Label>
              {approverType === "NONE" ? (
                <Input value="" disabled placeholder="—" />
              ) : approverType === "DEPT" ? (
                <Select
                  value={approverValue}
                  onValueChange={setApproverValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={deptsLoading ? "Loading…" : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.code}>
                        {d.code} — {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={approverValue}
                  onValueChange={setApproverValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={usersLoading ? "Loading…" : "Select user"} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.username || u.fullName || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label>SLA Approve (hours)</Label>
              <Input
                type="number"
                min={1}
                value={slaApproveHours}
                onChange={(e) => setSlaApproveHours(Number(e.target.value))}
                disabled={approverType === "NONE"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={upsert.isPending}>
              {upsert.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
