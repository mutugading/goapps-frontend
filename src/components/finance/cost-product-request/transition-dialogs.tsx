"use client"

// transition-dialogs — small per-transition modal helpers (reason / decision / substatus inputs).
import { useMemo, useState } from "react"
import { Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCostProductMaster, useCostProductMasters } from "@/hooks/finance/use-cost-product-master"
import { cn } from "@/lib/utils"
import type { ClosedSubstatus, ProductClassification } from "@/types/finance/cost-product-request"

// ----- ReasonDialog: used by Reject + Cancel (any free-text "why" prompt). ----------------
interface ReasonProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  pending?: boolean
  onConfirm: (reason: string) => void
}

export function ReasonDialog({ open, onOpenChange, title, description, confirmLabel, pending, onConfirm }: ReasonProps) {
  const [reason, setReason] = useState("")
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setReason("")
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason-input">Reason *</Label>
          <Textarea id="reason-input" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={!reason.trim() || pending} onClick={() => onConfirm(reason.trim())}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----- VerifyClassificationDialog -------------------------------------------------------
interface VerifyProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentClassification: ProductClassification
  pending?: boolean
  onConfirm: (verified: ProductClassification, overrideReason: string) => void
}

export function VerifyClassificationDialog({ open, onOpenChange, currentClassification, pending, onConfirm }: VerifyProps) {
  const [verified, setVerified] = useState<ProductClassification>(currentClassification)
  const [overrideReason, setOverrideReason] = useState("")
  const isOverride = verified !== currentClassification

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setVerified(currentClassification)
          setOverrideReason("")
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify classification</DialogTitle>
          <DialogDescription>
            Marketing marked this as <strong>{currentClassification}</strong>. Confirm or override; an override
            requires a reason.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <RadioGroup
            value={verified}
            onValueChange={(v) => setVerified(v as ProductClassification)}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="existing" />
              Existing
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="new" />
              New
            </label>
          </RadioGroup>
          {isOverride && (
            <div className="space-y-2">
              <Label>Override reason *</Label>
              <Textarea rows={3} value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={(isOverride && !overrideReason.trim()) || pending}
            onClick={() => onConfirm(verified, isOverride ? overrideReason.trim() : "")}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----- FeasibilityDialog -----------------------------------------------------------------
interface FeasibilityProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending?: boolean
  onConfirm: (decision: "FEASIBLE" | "NOT_FEASIBLE", note: string) => void
}

export function FeasibilityDialog({ open, onOpenChange, pending, onConfirm }: FeasibilityProps) {
  const [decision, setDecision] = useState<"FEASIBLE" | "NOT_FEASIBLE">("FEASIBLE")
  const [note, setNote] = useState("")
  const isInfeasible = decision === "NOT_FEASIBLE"

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setDecision("FEASIBLE")
          setNote("")
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decide feasibility</DialogTitle>
          <DialogDescription>
            FEASIBLE moves the request to ROUTING_DEFINED. NOT_FEASIBLE sends it to REJECTED — note is required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <RadioGroup
            value={decision}
            onValueChange={(v) => setDecision(v as "FEASIBLE" | "NOT_FEASIBLE")}
            className="flex gap-6"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="FEASIBLE" />
              Feasible
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value="NOT_FEASIBLE" />
              Not feasible
            </label>
          </RadioGroup>
          <div className="space-y-2">
            <Label>Note {isInfeasible ? "*" : "(optional)"}</Label>
            <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={isInfeasible ? "destructive" : "default"}
            disabled={(isInfeasible && !note.trim()) || pending}
            onClick={() => onConfirm(decision, note.trim())}
          >
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isInfeasible ? "Reject as infeasible" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----- CloseDialog -----------------------------------------------------------------------
interface CloseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending?: boolean
  onConfirm: (substatus: ClosedSubstatus) => void
}

export function CloseDialog({ open, onOpenChange, pending, onConfirm }: CloseProps) {
  const [substatus, setSubstatus] = useState<ClosedSubstatus>("won")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close request</DialogTitle>
          <DialogDescription>Pick the closed sub-status.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Sub-status *</Label>
          <Select value={substatus} onValueChange={(v) => setSubstatus(v as ClosedSubstatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="on_hold">On hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(substatus)} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----- UseExistingCostingDialog: requires picking which existing product master's
// costing the request reuses, before transitioning UNDER_REVIEW → QUOTE_READY. ---
interface UseExistingProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending?: boolean
  onConfirm: (existingProductSysId: number) => void
}

export function UseExistingCostingDialog({ open, onOpenChange, pending, onConfirm }: UseExistingProps) {
  const [productSysId, setProductSysId] = useState<number | undefined>()
  const [search, setSearch] = useState("")
  const { data, isLoading } = useCostProductMasters({ search, activeFilter: "active", pageSize: 30 })
  const { data: product } = useCostProductMaster(productSysId)
  const items = useMemo(() => data?.items ?? [], [data])
  const canSubmit = !!productSysId && productSysId > 0

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setProductSysId(undefined)
          setSearch("")
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use existing costing</DialogTitle>
          <DialogDescription>
            Pick the product master whose costing this request will reuse. The request will move
            straight to QUOTE_READY, and the picked product is recorded for traceability.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Existing product *</Label>
            <Command shouldFilter={false} className="rounded border">
              <CommandInput
                placeholder="Search by code or name…"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="max-h-40">
                {isLoading && (
                  <div className="py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                  </div>
                )}
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup>
                  {items.map((p) => (
                    <CommandItem
                      key={p.productSysId}
                      value={`${p.productCode} ${p.productName}`}
                      onSelect={() => setProductSysId(p.productSysId)}
                    >
                      <Check className={cn("mr-2 h-4 w-4", productSysId === p.productSysId ? "opacity-100" : "opacity-0")} />
                      <span className="font-mono text-xs text-muted-foreground mr-2">{p.productCode}</span>
                      {p.productName}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
            <p className="text-xs text-muted-foreground">
              Only products that already have an active product order should be picked here. If
              there&apos;s no match,{" "}
              <a href="/finance/product-master" className="underline" target="_blank" rel="noreferrer">
                check Product Master
              </a>
              .
            </p>
          </div>
          {product && (
            <div className="rounded border bg-muted/40 p-2 text-xs space-y-0.5">
              <div>
                <span className="text-muted-foreground">Code:</span>{" "}
                <span className="font-mono">{product.productCode}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Name:</span> {product.productName}
              </div>
              {product.productTypeName && (
                <div>
                  <span className="text-muted-foreground">Type:</span> {product.productTypeName}
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit || pending} onClick={() => productSysId && onConfirm(productSysId)}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Use existing costing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ----- ConfirmActionDialog: pre-action checklist shown before Confirm/Approve/Release ----------
interface ConfirmActionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: "confirm" | "approve" | "release"
  pending: boolean
  totalParams: number
  filledParams: number
  isLocked: boolean
  onConfirm: () => void
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  action,
  pending,
  totalParams,
  filledParams,
  isLocked,
  onConfirm,
}: ConfirmActionDialogProps) {
  const allFilled = totalParams > 0 && filledParams >= totalParams
  const label = action.charAt(0).toUpperCase() + action.slice(1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{label} Request</DialogTitle>
          <DialogDescription>
            You are about to <strong>{action}</strong> this request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2 text-sm">
          <p className="font-medium text-muted-foreground">Quick summary:</p>
          <ul className="space-y-1.5">
            <li
              className={`flex items-center gap-2 ${
                allFilled ? "text-green-600 dark:text-green-400" : "text-destructive"
              }`}
            >
              <span>{allFilled ? "✓" : "✗"}</span>
              {filledParams} / {totalParams} params filled across all products
            </li>
            <li
              className={`flex items-center gap-2 ${
                isLocked
                  ? "text-green-600 dark:text-green-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              <span>{isLocked ? "✓" : "⚠"}</span>
              Route is {isLocked ? "LOCKED" : "not locked"}
            </li>
          </ul>
          <p className="pt-1 text-xs text-muted-foreground">
            This action cannot be undone. The backend will reject if preconditions are not met.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Yes, {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
