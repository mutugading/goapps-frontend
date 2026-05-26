"use client"

import { useState } from "react"

import { ProductMasterCombobox } from "@/components/finance/comboboxes/product-master-combobox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouteByProduct } from "@/hooks/finance/use-cost-route"

interface Props {
  open: boolean
  onClose: () => void
  onPick: (headId: number) => void
}

export function PickExistingRouteDialog({ open, onClose, onPick }: Props) {
  const [productSysId, setProductSysId] = useState<number | undefined>()
  const [productCode, setProductCode] = useState<string>("")
  const [productName, setProductName] = useState<string>("")
  const { data: head } = useRouteByProduct(productSysId)

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pick existing product with route</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Product (must already have an active route)</Label>
            <ProductMasterCombobox
              value={productSysId}
              onChange={(id, code, name) => {
                setProductSysId(id)
                setProductCode(code)
                setProductName(name)
              }}
              placeholder="Search product by code or name…"
            />
          </div>
          {productSysId && (
            <div className="rounded border bg-muted/30 p-2 text-sm">
              {head ? (
                <>
                  <div className="font-mono">
                    Route #{head.headId} · {head.routingStatus}
                  </div>
                  <div className="text-muted-foreground">
                    {productCode} — {productName}
                  </div>
                </>
              ) : (
                <span className="text-amber-700">This product does not have a route yet.</span>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!head} onClick={() => head && onPick(head.headId)}>
            Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
