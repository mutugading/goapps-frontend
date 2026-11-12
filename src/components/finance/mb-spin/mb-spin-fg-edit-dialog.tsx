"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FgPoyCombobox } from "@/components/finance/comboboxes/fg-poy-combobox"
import type { MBSpin } from "@/types/finance/mb-spin"
import { useUpdateMBSpinWithCascade } from "@/hooks/finance/use-mb-spin"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mbSpin: MBSpin
}

// Manual FG (POY) edit for spins whose FG does not come from their recipe
// (mb-spin-fg-poy-link P8). Sends fgProductId only: >0 = link, 0 = remove link.
export function MBSpinFgEditDialog({ open, onOpenChange, mbSpin }: Props) {
  const [picked, setPicked] = useState<number | undefined>(undefined)
  const updateM = useUpdateMBSpinWithCascade()
  const current = Number(mbSpin.fgProductId ?? 0)
  const value = picked ?? (current > 0 ? current : undefined)

  const submit = (fgProductId: number) => {
    updateM.mutate(
      { mbhId: mbSpin.mbsMbhId, mbsId: mbSpin.mbsId, fgProductId },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setPicked(undefined)
        onOpenChange(o)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit FG (POY)</DialogTitle>
          <DialogDescription>
            Only active POY products with shade {mbSpin.mbsShadeCode || "—"} are listed.
          </DialogDescription>
        </DialogHeader>
        <FgPoyCombobox
          value={value}
          shadeCode={mbSpin.mbsShadeCode || undefined}
          allowCreate={false}
          disabled={updateM.isPending}
          selectedLabel={
            current > 0 && mbSpin.fgProductCode
              ? `${mbSpin.fgProductCode}${mbSpin.fgProductName ? ` — ${mbSpin.fgProductName}` : ""}`
              : undefined
          }
          onChange={(id) => setPicked(id)}
        />
        <DialogFooter className="gap-2 sm:justify-between">
          {current > 0 ? (
            <Button
              type="button"
              variant="outline"
              disabled={updateM.isPending}
              onClick={() => submit(0)}
            >
              Remove FG link
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={updateM.isPending || !value || value === current}
              onClick={() => value && submit(value)}
            >
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
