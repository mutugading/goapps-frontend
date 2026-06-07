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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: LevelAssignmentConfig;
}

export function FillConfigForm({ open, onOpenChange, existing }: Props) {
  const [routeLevel, setRouteLevel] = useState(existing?.routeLevel ?? 1);
  const [fillerType, setFillerType] = useState(existing?.fillerType ?? "USER");
  const [fillerValue, setFillerValue] = useState(existing?.fillerValue ?? "");
  const [approverType, setApproverType] = useState(existing?.approverType || "NONE");
  const [approverValue, setApproverValue] = useState(existing?.approverValue ?? "");
  const [slaFillHours, setSlaFillHours] = useState(existing?.slaFillHours ?? 48);
  const [slaApproveHours, setSlaApproveHours] = useState(existing?.slaApproveHours ?? 24);

  const upsert = useUpsertFillConfig();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    upsert.mutate(
      {
        tier: "GLOBAL",
        routeLevel,
        fillerType,
        fillerValue,
        approverType: approverType === "NONE" ? undefined : approverType || undefined,
        approverValue: approverValue || undefined,
        slaFillHours,
        slaApproveHours,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit" : "Add"} Level Config</DialogTitle>
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
            <div>
              <Label>Filler Type</Label>
              <Select value={fillerType} onValueChange={setFillerType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="DEPT">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filler Value</Label>
              <Input
                value={fillerValue}
                onChange={(e) => setFillerValue(e.target.value)}
                placeholder="User ID or dept code"
              />
            </div>
            <div>
              <Label>Approver Type (optional)</Label>
              <Select value={approverType} onValueChange={setApproverType}>
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
            <div>
              <Label>Approver Value</Label>
              <Input
                value={approverValue}
                onChange={(e) => setApproverValue(e.target.value)}
                placeholder="User ID or dept code"
                disabled={approverType === "NONE"}
              />
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
