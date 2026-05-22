"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useDeactivateCostProductMaster } from "@/hooks/finance/use-cost-product-master"
import type { CostProductMaster } from "@/types/finance/cost-product-master"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: CostProductMaster | null
}

export function DeactivateProductMasterDialog({ open, onOpenChange, product }: Props) {
  const mutation = useDeactivateCostProductMaster()

  if (!product) return null

  async function onConfirm() {
    if (!product) return
    try {
      await mutation.mutateAsync(product.productSysId)
      onOpenChange(false)
    } catch {
      /* toast in hook */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivate product?</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{product.productCode}</span> — {product.productName}
            <br />
            Deactivating hides this product from new orders but preserves history. This action is reversible
            via direct DB edit only.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
