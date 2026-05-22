"use client"

import { useState } from "react"
import { toast } from "sonner"

import { ProductMasterCombobox } from "@/components/finance/comboboxes/product-master-combobox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Props {
  open: boolean
  onClose: () => void
  /**
   * Request ID this wizard is launched from. Pass 0 to indicate standalone
   * (e.g. from the routes list page) — no auto-linking is implied.
   */
  requestId: number
}

export function CreateRoutingWizard({ open, onClose, requestId }: Props) {
  const [productSysId, setProductSysId] = useState<number | undefined>()

  const handleSubmit = () => {
    // Backend RPC CreateFromProduct is not implemented yet — see plan S7.17e.
    toast.error(
      "Creating a new route head from a product is not yet implemented. " +
        "Use 'Pick existing product with route' or 'Fork an existing route' instead.",
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new routing</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
            Coming soon: backend support for creating a fresh route from a chosen product master. For now,
            this wizard is read-only — pick a product to preview, but use Pick-existing-route or Fork instead.
          </div>
          <div>
            <Label>FG product master</Label>
            <ProductMasterCombobox
              value={productSysId}
              onChange={(id) => setProductSysId(id)}
              placeholder="Search product by code or name…"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {requestId > 0
                ? "Will link the new route to this request."
                : "Standalone route (no request link)."}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!productSysId} onClick={handleSubmit}>
            Create route
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
