"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ProductMasterCombobox } from "@/components/finance/comboboxes/product-master-combobox"
import { ProductTypeCombobox } from "@/components/finance/comboboxes/product-type-combobox"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCreateCostProductMaster } from "@/hooks/finance/use-cost-product-master"
import { useCreateRouteFromProduct } from "@/hooks/finance/use-cost-route"

interface Props {
  open: boolean
  onClose: () => void
  /** Pass 0 when launched from Routes list (no auto-link to a request). */
  requestId: number
}

type Mode = "existing" | "new"

export function CreateRoutingWizard({ open, onClose, requestId }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [mode, setMode] = useState<Mode>("existing")
  const [existingProductSysId, setExistingProductSysId] = useState<number | undefined>()
  const [newProduct, setNewProduct] = useState({
    name: "",
    typeId: 0,
    shade: "",
    grade: "AX",
    description: "",
  })

  const createProductM = useCreateCostProductMaster()
  const createRouteM = useCreateRouteFromProduct()

  const reset = () => {
    setStep(1)
    setMode("existing")
    setExistingProductSysId(undefined)
    setNewProduct({ name: "", typeId: 0, shade: "", grade: "AX", description: "" })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = async () => {
    try {
      let productSysId = existingProductSysId
      if (mode === "new") {
        const created = await createProductM.mutateAsync({
          productTypeId: newProduct.typeId,
          productName: newProduct.name,
          shadeCode: newProduct.shade,
          gradeCode: newProduct.grade || "AX",
          description: newProduct.description,
        })
        productSysId = created.productSysId
        if (!productSysId) throw new Error("Product master create returned no sys id")
      }
      if (!productSysId) {
        toast.error("Pick or create a product first")
        return
      }
      const newHeadId = await createRouteM.mutateAsync({
        productSysId,
        linkedRequestId: requestId,
      })
      handleClose()
      router.push(`/finance/routes/${newHeadId}`)
    } catch {
      // Mutation hooks already surface a toast; avoid double-toasting.
    }
  }

  const canSubmitStep1 = mode === "existing" && !!existingProductSysId
  const canSubmitStep2 =
    mode === "new" && newProduct.name.trim().length > 0 && newProduct.typeId > 0

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create new routing {mode === "new" ? `(step ${step} of 2)` : ""}</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3">
            <Label>FG product source</Label>
            <RadioGroup value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="existing" id="m-existing" />
                <Label htmlFor="m-existing">Pick existing product master</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="new" id="m-new" />
                <Label htmlFor="m-new">Create new product master</Label>
              </div>
            </RadioGroup>
            {mode === "existing" && (
              <div className="space-y-1">
                <Label>Product (existing master)</Label>
                <ProductMasterCombobox
                  value={existingProductSysId}
                  onChange={(id) => setExistingProductSysId(id)}
                  placeholder="Search product by code or name…"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {requestId > 0
                    ? "The new route will be linked to this request."
                    : "Standalone route (no request link)."}
                </p>
              </div>
            )}
            {mode === "new" && (
              <p className="text-xs text-muted-foreground">
                Next: provide the new product master fields (code is auto-generated).
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div>
              <Label>Product name *</Label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g. PTY 75/72 SD BRIGHT"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Product type *</Label>
                <ProductTypeCombobox
                  value={newProduct.typeId || undefined}
                  onChange={(id) => setNewProduct({ ...newProduct, typeId: id })}
                />
              </div>
              <div>
                <Label>Grade code</Label>
                <Input
                  value={newProduct.grade}
                  onChange={(e) => setNewProduct({ ...newProduct, grade: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Shade code (optional)</Label>
              <Input
                value={newProduct.shade}
                onChange={(e) => setNewProduct({ ...newProduct, shade: e.target.value })}
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Product code is auto-generated. Required parameters (CAPP) are empty initially — open
              the new product master after creation to fill values.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === 2 && (
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              disabled={createProductM.isPending || createRouteM.isPending}
            >
              Back
            </Button>
          )}
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          {step === 1 && mode === "existing" && (
            <Button disabled={!canSubmitStep1 || createRouteM.isPending} onClick={handleSubmit}>
              {createRouteM.isPending ? "Creating…" : "Create route"}
            </Button>
          )}
          {step === 1 && mode === "new" && <Button onClick={() => setStep(2)}>Next</Button>}
          {step === 2 && (
            <Button
              disabled={!canSubmitStep2 || createProductM.isPending || createRouteM.isPending}
              onClick={handleSubmit}
            >
              {createProductM.isPending || createRouteM.isPending ? "Creating…" : "Create product + route"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
