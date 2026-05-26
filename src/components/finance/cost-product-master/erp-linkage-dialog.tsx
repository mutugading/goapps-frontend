"use client"

// ErpLinkageDialog — links a product master to ERP master_item + grade codes.
// Uses ErpItemCombobox so the user never sees raw IDs; we store item_code (string) on submit.
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { ErpItemCombobox } from "@/components/finance/comboboxes"
import { useUpdateErpLinkage } from "@/hooks/finance/use-cost-product-master"
import type { CostProductMaster } from "@/types/finance/cost-product-master"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: CostProductMaster | null
}

export function ErpLinkageDialog({ open, onOpenChange, product }: Props) {
  // Body is keyed by product.productSysId, so changing the active product remounts
  // the inner state-holding component — avoiding setState-in-effect on prop change.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        {product && (
          <ErpLinkageDialogBody
            key={product.productSysId}
            product={product}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function ErpLinkageDialogBody({
  product,
  onClose,
}: {
  product: CostProductMaster
  onClose: () => void
}) {
  const mutation = useUpdateErpLinkage()
  const [erpItemCode, setErpItemCode] = useState(product.erpItemCode || "")
  const [erpGrade1, setErpGrade1] = useState(product.erpGradeCode1 || "")
  const [erpGrade2, setErpGrade2] = useState(product.erpGradeCode2 || "")

  async function onSubmit() {
    try {
      await mutation.mutateAsync({
        productSysId: product.productSysId,
        erpItemCode,
        erpGradeCode1: erpGrade1,
        erpGradeCode2: erpGrade2,
      })
      onClose()
    } catch {
      /* toast in hook */
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>ERP linkage for {product.productCode}</DialogTitle>
        <DialogDescription>
          Link this product to an ERP master_item and up to two ERP grade codes. Clear the item
          field to unlink.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>ERP item</Label>
          <ErpItemCombobox
            value={undefined}
            onChange={(_id, code) => setErpItemCode(code)}
            placeholder={erpItemCode ? `Currently: ${erpItemCode}` : "Pick an ERP item…"}
          />
          {erpItemCode && (
            <div className="text-xs text-muted-foreground">
              Selected: <span className="font-mono">{erpItemCode}</span>{" "}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => setErpItemCode("")}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>ERP grade 1</Label>
            <Input value={erpGrade1} onChange={(e) => setErpGrade1(e.target.value)} placeholder="AX" />
          </div>
          <div className="space-y-1.5">
            <Label>ERP grade 2</Label>
            <Input
              value={erpGrade2}
              onChange={(e) => setErpGrade2(e.target.value)}
              placeholder="(optional)"
            />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save linkage
        </Button>
      </DialogFooter>
    </>
  )
}
