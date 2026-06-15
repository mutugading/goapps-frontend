"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { useOverrideParamValues } from "@/hooks/finance/use-param-summary"
import type { ParamValueEntry } from "@/types/finance/param-summary"

interface OverrideValue {
  productSysId: number
  paramId: string
  valueNumeric?: string
  valueText?: string
  valueFlag?: boolean
  hasValueFlag?: boolean
}

interface Props {
  open: boolean
  onClose: () => void
  requestId: number
  routeLevel: number
  productSysId: number
  productCode: string
  params: ParamValueEntry[]
}

export function OverrideParamsDrawer({
  open,
  onClose,
  requestId,
  routeLevel,
  productSysId,
  productCode,
  params,
}: Props) {
  const overrideMutation = useOverrideParamValues(requestId)

  // Local state: map of paramId → current draft value string (or bool for flags)
  const [numericValues, setNumericValues] = useState<Record<string, string>>({})
  const [textValues, setTextValues] = useState<Record<string, string>>({})
  const [flagValues, setFlagValues] = useState<Record<string, boolean>>({})

  // Reset to current param values whenever the drawer opens
  useEffect(() => {
    if (!open) return
    const nums: Record<string, string> = {}
    const texts: Record<string, string> = {}
    const flags: Record<string, boolean> = {}
    for (const p of params) {
      if (p.dataType === "NUMBER") {
        nums[p.paramId.toString()] = p.hasValue ? p.valueNumeric : ""
      } else if (p.dataType === "TEXT") {
        texts[p.paramId.toString()] = p.hasValue ? p.valueText : ""
      } else if (p.dataType === "BOOLEAN") {
        flags[p.paramId.toString()] = p.hasValue ? p.valueFlag : false
      }
    }
    setNumericValues(nums)
    setTextValues(texts)
    setFlagValues(flags)
  }, [open, params])

  function handleSave() {
    const values: OverrideValue[] = params.map((p) => {
      const key = p.paramId.toString()
      if (p.dataType === "NUMBER") {
        return { productSysId, paramId: key, valueNumeric: numericValues[key] ?? "" }
      }
      if (p.dataType === "TEXT") {
        return { productSysId, paramId: key, valueText: textValues[key] ?? "" }
      }
      // BOOLEAN
      return {
        productSysId,
        paramId: key,
        valueFlag: flagValues[key] ?? false,
        hasValueFlag: true,
      }
    })
    overrideMutation.mutate(
      { routeLevel, values },
      { onSuccess: onClose },
    )
  }

  const isDirty = params.some((p) => {
    const key = p.paramId.toString()
    if (p.dataType === "NUMBER") return (numericValues[key] ?? "") !== (p.hasValue ? p.valueNumeric : "")
    if (p.dataType === "TEXT") return (textValues[key] ?? "") !== (p.hasValue ? p.valueText : "")
    return (flagValues[key] ?? false) !== (p.hasValue ? p.valueFlag : false)
  })

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex flex-col p-0 w-full sm:max-w-lg gap-0"
      >
        {/* Sticky header */}
        <div className="flex shrink-0 items-start gap-3 border-b bg-background px-6 py-4">
          <div className="flex-1 min-w-0 space-y-0.5">
            <SheetTitle className="text-sm font-semibold leading-tight">
              Edit Params — Level {routeLevel}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {productCode} · {params.length} parameter{params.length !== 1 ? "s" : ""}
            </SheetDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={onClose}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </SheetClose>
          </div>
        </div>

        {/* Scrollable param list */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {params.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No parameters at this level.</p>
          )}
          {params.map((p) => {
            const key = p.paramId.toString()
            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <label className="text-xs font-medium">
                    {p.paramCode}
                    {p.isRequired && <span className="text-destructive ml-0.5">*</span>}
                  </label>
                  {p.uomCode && (
                    <span className="text-[10px] text-muted-foreground">{p.uomCode}</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{p.paramName}</p>
                {p.dataType === "NUMBER" && (
                  <Input
                    type="number"
                    value={numericValues[key] ?? ""}
                    onChange={(e) => setNumericValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="Enter value"
                    className="h-8 text-sm font-mono"
                  />
                )}
                {p.dataType === "TEXT" && (
                  <Input
                    value={textValues[key] ?? ""}
                    onChange={(e) => setTextValues((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder="Enter value"
                    className="h-8 text-sm"
                  />
                )}
                {p.dataType === "BOOLEAN" && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flagValues[key] ?? false}
                      onCheckedChange={(checked) =>
                        setFlagValues((prev) => ({ ...prev, [key]: checked }))
                      }
                    />
                    <span className="text-xs text-muted-foreground">
                      {(flagValues[key] ?? false) ? "True" : "False"}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Sticky footer */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t bg-background px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose} disabled={overrideMutation.isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!isDirty || overrideMutation.isPending}
            onClick={handleSave}
          >
            {overrideMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
