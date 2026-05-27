"use client"

import { useState } from "react"
import { Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  useCreateWorkflowTemplate,
  useUpdateWorkflowTemplate,
} from "@/hooks/iam/use-workflow-template"
import type {
  WorkflowTemplate,
  WorkflowTemplateStepInput,
} from "@/types/iam/workflow"

interface WorkflowTemplateFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: WorkflowTemplate | null
  onSuccess?: () => void
}

const KIND_OPTIONS = [
  { value: "PRODUCT_COSTING", label: "Product Costing" },
  { value: "PARAM_FILL", label: "Parameter Fill" },
] as const

const RESOLUTION_OPTIONS = [
  { value: "ROLE", label: "Role" },
  { value: "USER", label: "User" },
  { value: "DEPT", label: "Department" },
] as const

function emptyStep(stepNo: number): WorkflowTemplateStepInput {
  return {
    stepNo,
    stepName: "",
    approverResolutionType: "ROLE",
    approverResolutionValue: "",
    slaHours: 0,
    allowReject: true,
    allowReassign: false,
    requirePasswordOnUnlock: false,
    rejectToStepNo: 0,
  }
}

export function WorkflowTemplateFormDialog({
  open,
  onOpenChange,
  template,
  onSuccess,
}: WorkflowTemplateFormDialogProps) {
  // Remount the inner form whenever the dialog opens or the template changes —
  // this avoids the "setState in useEffect" anti-pattern flagged by the React
  // compiler. The inner component owns its initial state via lazy useState.
  if (!open) return <Dialog open={open} onOpenChange={onOpenChange} />
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <WorkflowTemplateFormBody
        key={template?.templateId ?? "__new__"}
        template={template ?? null}
        onClose={() => onOpenChange(false)}
        onSuccess={onSuccess}
      />
    </Dialog>
  )
}

interface FormBodyProps {
  template: WorkflowTemplate | null
  onClose: () => void
  onSuccess?: () => void
}

function WorkflowTemplateFormBody({ template, onClose, onSuccess }: FormBodyProps) {
  const isEditing = !!template
  const createMut = useCreateWorkflowTemplate()
  const updateMut = useUpdateWorkflowTemplate()

  // Lazy initializers — read template once at mount.
  const [kind, setKind] = useState<string>(() => template?.kind ?? "PRODUCT_COSTING")
  const [name, setName] = useState(() => template?.name ?? "")
  const [description, setDescription] = useState(() => template?.description ?? "")
  const [steps, setSteps] = useState<WorkflowTemplateStepInput[]>(() =>
    template && template.steps.length > 0
      ? template.steps.map((s, i) => ({
          stepNo: i + 1,
          stepName: s.stepName,
          approverResolutionType: s.approverResolutionType,
          approverResolutionValue: s.approverResolutionValue,
          slaHours: s.slaHours ?? 0,
          allowReject: s.allowReject,
          allowReassign: s.allowReassign,
          requirePasswordOnUnlock: s.requirePasswordOnUnlock,
          rejectToStepNo: s.rejectToStepNo ?? 0,
        }))
      : [emptyStep(1)],
  )
  const [errors, setErrors] = useState<string[]>([])

  const renumber = (next: WorkflowTemplateStepInput[]) =>
    next.map((s, i) => ({ ...s, stepNo: i + 1 }))

  const addStep = () => setSteps((prev) => renumber([...prev, emptyStep(prev.length + 1)]))
  const removeStep = (idx: number) =>
    setSteps((prev) => renumber(prev.filter((_, i) => i !== idx)))
  const moveStep = (idx: number, dir: -1 | 1) =>
    setSteps((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      const tmp = next[idx]
      next[idx] = next[target]
      next[target] = tmp
      return renumber(next)
    })
  const patchStep = (idx: number, patch: Partial<WorkflowTemplateStepInput>) =>
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))

  const validate = (): boolean => {
    const errs: string[] = []
    if (name.trim() === "") errs.push("Name is required")
    if (steps.length === 0) errs.push("At least one step is required")
    steps.forEach((s, i) => {
      if (s.stepName.trim() === "") errs.push(`Step ${i + 1}: step name is required`)
      if (s.approverResolutionValue.trim() === "")
        errs.push(`Step ${i + 1}: approver value is required`)
    })
    setErrors(errs)
    return errs.length === 0
  }

  const onSubmit = async () => {
    if (!validate()) return
    try {
      if (isEditing && template) {
        await updateMut.mutateAsync({
          templateId: template.templateId,
          payload: { name, description, steps },
        })
      } else {
        await createMut.mutateAsync({ kind, name, description, steps })
      }
      onClose()
      onSuccess?.()
    } catch {
      // toast already handled
    }
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Update Workflow Template" : "Create Workflow Template"}</DialogTitle>
        <DialogDescription>
          {isEditing
            ? "Saves as a new version (immutable history). Activate the new version to use it."
            : "Creates an inactive version. Click Activate after creating to deactivate older versions of the same kind."}
        </DialogDescription>
      </DialogHeader>

        {errors.length > 0 && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <ul className="list-disc pl-4">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Kind</Label>
              <Select value={kind} onValueChange={setKind} disabled={isEditing || isPending}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isEditing ? "Kind is immutable across versions." : "Determines where the workflow is used."}
              </p>
            </div>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard 3-Step Costing Approval"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              rows={2}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Steps ({steps.length})</Label>
              <Button type="button" size="sm" variant="outline" onClick={addStep} disabled={isPending}>
                <Plus className="mr-1 h-4 w-4" /> Add step
              </Button>
            </div>

            <ol className="space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="rounded-md border bg-card p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">Step #{s.stepNo}</p>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => moveStep(i, -1)}
                        disabled={i === 0 || isPending}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => moveStep(i, 1)}
                        disabled={i === steps.length - 1 || isPending}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStep(i)}
                        disabled={steps.length === 1 || isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Step Name</Label>
                      <Input
                        value={s.stepName}
                        onChange={(e) => patchStep(i, { stepName: e.target.value })}
                        placeholder="e.g. Finance Review"
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Resolve Approver By</Label>
                      <Select
                        value={s.approverResolutionType}
                        onValueChange={(v) => patchStep(i, { approverResolutionType: v })}
                        disabled={isPending}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESOLUTION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Approver Value</Label>
                      <Input
                        value={s.approverResolutionValue}
                        onChange={(e) => patchStep(i, { approverResolutionValue: e.target.value })}
                        placeholder={
                          s.approverResolutionType === "ROLE"
                            ? "Role code (e.g. FINANCE)"
                            : s.approverResolutionType === "USER"
                              ? "Username"
                              : "Department code"
                        }
                        disabled={isPending}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">SLA Hours (0 = none)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={s.slaHours}
                        onChange={(e) => patchStep(i, { slaHours: Number(e.target.value) || 0 })}
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={s.allowReject}
                        onCheckedChange={(c) => patchStep(i, { allowReject: c === true })}
                        disabled={isPending}
                      />
                      Allow reject
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={s.allowReassign}
                        onCheckedChange={(c) => patchStep(i, { allowReassign: c === true })}
                        disabled={isPending}
                      />
                      Allow reassign
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox
                        checked={s.requirePasswordOnUnlock}
                        onCheckedChange={(c) => patchStep(i, { requirePasswordOnUnlock: c === true })}
                        disabled={isPending}
                      />
                      Require password on unlock
                    </label>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save as New Version" : "Create"}
          </Button>
        </DialogFooter>
    </DialogContent>
  )
}
