"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export type WorkflowAction = "submit" | "approve" | "release" | "bypass-release"

interface EmployeeLevelWorkflowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: WorkflowAction
  entityCode: string
  entityName: string
  isLoading?: boolean
  onConfirm: (notes: string) => void | Promise<void>
}

const ACTION_CONFIG: Record<
  WorkflowAction,
  { title: string; description: string; confirmText: string; variant: "default" | "destructive" }
> = {
  submit: {
    title: "Submit for Approval",
    description: "Submit this employee level for review and approval.",
    confirmText: "Submit",
    variant: "default",
  },
  approve: {
    title: "Approve Employee Level",
    description: "Approve this submitted employee level. It will then be eligible for release.",
    confirmText: "Approve",
    variant: "default",
  },
  release: {
    title: "Release Employee Level",
    description: "Release this approved employee level. Once released, it becomes active.",
    confirmText: "Release",
    variant: "default",
  },
  "bypass-release": {
    title: "Bypass Release",
    description:
      "Bypass the normal approval flow and release this employee level immediately. This action requires elevated permissions and is recorded in the audit log.",
    confirmText: "Bypass Release",
    variant: "destructive",
  },
}

export function EmployeeLevelWorkflowDialog({
  open,
  onOpenChange,
  action,
  entityCode,
  entityName,
  isLoading,
  onConfirm,
}: EmployeeLevelWorkflowDialogProps) {
  const [notes, setNotes] = useState("")
  const config = ACTION_CONFIG[action]

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setNotes("")
    onOpenChange(nextOpen)
  }

  const handleConfirm = async () => {
    await onConfirm(notes)
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-md border bg-muted/30 p-3 text-sm">
            <div className="flex items-baseline gap-2">
              <span className="font-mono font-medium">{entityCode}</span>
              <span className="text-muted-foreground">—</span>
              <span>{entityName}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workflow-notes">Notes (optional)</Label>
            <Textarea
              id="workflow-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or reason for this action..."
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {notes.length}/500 characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={config.variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
