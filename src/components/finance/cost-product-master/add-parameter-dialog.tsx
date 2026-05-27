"use client"

import { useMemo, useState } from "react"
import { Loader2, Plus } from "lucide-react"

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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useAddApplicableParam, useAvailableParams } from "@/hooks/finance/use-cost-product-parameter"
import type { AvailableParamEntry } from "@/types/finance/cost-product-parameter"

interface Props {
  productSysId: number
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function AddParameterDialog({ productSysId, open, onOpenChange }: Props) {
  const { data: available, isLoading } = useAvailableParams(productSysId)
  const addM = useAddApplicableParam()
  const [search, setSearch] = useState("")
  const [overrides, setOverrides] = useState<Record<string, boolean>>({}) // paramId → isRequired

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    if (!s) return available ?? []
    return (available ?? []).filter(
      (p) =>
        p.paramCode.toLowerCase().includes(s) ||
        p.paramName.toLowerCase().includes(s) ||
        p.displayGroup.toLowerCase().includes(s),
    )
  }, [available, search])

  async function handleAdd(entry: AvailableParamEntry) {
    const isReq = overrides[entry.paramId] ?? entry.isRequiredForCosting
    await addM.mutateAsync({
      productSysId,
      paramId: entry.paramId,
      isRequired: isReq,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Parameter to Product</DialogTitle>
          <DialogDescription>
            Pick from active parameters that are not yet applicable to this product. You can toggle
            the per-product Required flag before adding.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Search by code, name, or group…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading…
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              No more parameters available. Define new ones at{" "}
              <a href="/finance/master/parameter" className="underline">
                Finance &gt; Master &gt; Parameter
              </a>
              .
            </div>
          )}
          <div className="space-y-2">
            {filtered.map((entry) => (
              <div
                key={entry.paramId}
                className="rounded border p-3 grid grid-cols-12 gap-3 items-center"
              >
                <div className="col-span-7">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {entry.paramName}
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {entry.paramCode}
                    </Badge>
                    {entry.paramCategory === "CALCULATED" && (
                      <Badge variant="secondary" className="text-[10px]">
                        engine-filled
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {entry.displayGroup || "General"} · {entry.dataType}
                    {entry.uomCode && <> · {entry.uomCode}</>}
                    {entry.ownerDepartment && <> · Owner: {entry.ownerDepartment}</>}
                  </div>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <Switch
                    checked={overrides[entry.paramId] ?? entry.isRequiredForCosting}
                    onCheckedChange={(v) =>
                      setOverrides((prev) => ({ ...prev, [entry.paramId]: v }))
                    }
                  />
                  <Label className="text-xs">Required</Label>
                </div>
                <div className="col-span-2 text-right">
                  <Button
                    size="sm"
                    onClick={() => handleAdd(entry)}
                    disabled={addM.isPending}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
