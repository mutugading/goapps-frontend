"use client"

// Parameters tab on the product-master detail page.
// Lists every mst_parameter (filtered by is_period_dependent=FALSE) grouped by
// display_group, lets the responsible user fill values, and saves them in a
// single batch.

import { useCallback, useMemo, useState } from "react"
import { Loader2, Save, AlertCircle, Plus, Trash2, ArrowUp } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  useProductRequiredParams,
  useUpsertProductParamValuesBatch,
  useMissingRequiredParams,
  useRemoveApplicableParam,
} from "@/hooks/finance/use-cost-product-parameter"
import type { RequiredParamEntry, UpsertParamValuePayload } from "@/types/finance/cost-product-parameter"
import type { LookupFillValuesResponse } from "@/types/finance/yarn-master"
import type { RemoveApplicablePreview } from "@/types/finance/lookup-master"
import { AddParameterDialog } from "./add-parameter-dialog"
import { MasterLookupField } from "./master-lookup-field"
import { ConfirmDialog } from "@/components/shared/confirm-dialog/confirm-dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ParametersTabProps {
  productSysId: number
}

export interface DraftValue {
  valueNumeric: string
  valueText: string
  valueFlag: boolean
  hasValueFlag: boolean // BOOLEAN params explicitly opt in to send the value
  dirty: boolean
}

function emptyDraft(entry: RequiredParamEntry): DraftValue {
  return {
    valueNumeric: entry.hasValue ? entry.valueNumeric : "",
    valueText: entry.hasValue ? entry.valueText : "",
    valueFlag: entry.hasValue ? entry.valueFlag : false,
    hasValueFlag: entry.hasValue && entry.dataType === "BOOLEAN",
    dirty: false,
  }
}

export function ProductParametersTab({ productSysId }: ParametersTabProps) {
  const { data, isLoading } = useProductRequiredParams(productSysId)
  const { data: missing } = useMissingRequiredParams(productSysId)
  const upsertM = useUpsertProductParamValuesBatch()
  const removeM = useRemoveApplicableParam()
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)

  // Remove confirm state — used when removing a MASTER_LOOKUP trigger param.
  const [removePreviewEntry, setRemovePreviewEntry] = useState<RequiredParamEntry | null>(null)
  const [removePreview, setRemovePreview] = useState<RemoveApplicablePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [removeInProgress, setRemoveInProgress] = useState(false)

  // Edits made by the user, indexed by paramId. Unedited rows derive their
  // draft from the loaded entries via useMemo below — no useEffect needed.
  const [edits, setEdits] = useState<Record<string, DraftValue>>({})

  const drafts = useMemo<Record<string, DraftValue>>(() => {
    const out: Record<string, DraftValue> = {}
    for (const entry of data ?? []) {
      out[entry.paramId] = edits[entry.paramId] ?? emptyDraft(entry)
    }
    return out
  }, [data, edits])

  const patch = useCallback(
    (paramId: string, p: Partial<DraftValue>) => {
      setEdits((prev) => ({
        ...prev,
        [paramId]: { ...(prev[paramId] ?? drafts[paramId]), ...p, dirty: true },
      }))
    },
    [drafts],
  )

  const handleLookupChange = useCallback(
    (
      triggerParamId: string,
      selectedKey: string,
      fills: LookupFillValuesResponse | null,
    ) => {
      patch(triggerParamId, { valueText: selectedKey })
      if (!fills || !data) return

      for (const [paramCode, numVal] of Object.entries(fills.numericFills)) {
        const target = data.find((e) => e.paramCode === paramCode)
        if (target) patch(target.paramId, { valueNumeric: String(numVal) })
      }
      for (const [paramCode, textVal] of Object.entries(fills.textFills)) {
        const target = data.find((e) => e.paramCode === paramCode)
        if (target) patch(target.paramId, { valueText: textVal })
      }
      if (fills.displayLabel) {
        toast.success(`Auto-filled from: ${fills.displayLabel}`)
      }
    },
    [patch, data],
  )

  const grouped = useMemo(() => {
    const out = new Map<string, RequiredParamEntry[]>()
    for (const entry of data ?? []) {
      const key = entry.displayGroup || "General"
      if (!out.has(key)) out.set(key, [])
      out.get(key)!.push(entry)
    }
    return Array.from(out.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [data])

  const dirtyCount = Object.values(drafts).filter((d) => d.dirty).length
  const missingCount = missing?.length ?? 0

  async function handleRemoveClick(entry: RequiredParamEntry) {
    if (entry.paramCategory === "MASTER_LOOKUP") {
      setPreviewLoading(true)
      setRemovePreviewEntry(entry)
      try {
        const res = await fetch("/api/v1/finance/cost-product-parameters/applicable/remove-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSysId, paramId: entry.paramId }),
        })
        if (res.ok) {
          const json = await res.json() as { data?: RemoveApplicablePreview }
          setRemovePreview(json.data ?? null)
        }
      } finally {
        setPreviewLoading(false)
      }
    } else {
      removeM.mutate({ productSysId, paramId: entry.paramId })
    }
  }

  async function handleRemoveWithChildren() {
    if (!removePreviewEntry) return
    setRemoveInProgress(true)
    try {
      const res = await fetch(
        "/api/v1/finance/cost-product-parameters/applicable/remove-with-children",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productSysId, paramId: removePreviewEntry.paramId }),
        },
      )
      if (!res.ok) {
        const body = (await res.json()) as { base?: { message?: string } }
        toast.error(body?.base?.message ?? "Failed to remove parameter")
        return // keep dialog open for retry
      }
      toast.success("Parameter removed")
      await qc.invalidateQueries({ queryKey: ["finance", "cost-product-parameter"] })
      setRemovePreviewEntry(null)
      setRemovePreview(null)
    } catch {
      toast.error("Failed to remove parameter")
    } finally {
      setRemoveInProgress(false)
    }
  }

  async function handleSave() {
    if (!data) return
    const values: UpsertParamValuePayload[] = []
    for (const entry of data) {
      const d = drafts[entry.paramId]
      if (!d?.dirty) continue
      const v: UpsertParamValuePayload = { productSysId, paramId: entry.paramId }
      switch (entry.dataType) {
        case "NUMBER":
          if (d.valueNumeric.trim() === "") continue
          v.valueNumeric = d.valueNumeric.trim()
          break
        case "TEXT":
          if (d.valueText.trim() === "") continue
          v.valueText = d.valueText.trim()
          break
        case "BOOLEAN":
          v.valueFlag = d.valueFlag
          v.hasValueFlag = true
          break
      }
      values.push(v)
    }
    if (values.length === 0) return
    await upsertM.mutateAsync({ productSysId, values })
    setEdits({})
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading parameters…
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <>
        <div className="rounded border border-dashed py-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No parameters are applicable to this product yet.
          </p>
          <Button onClick={() => setAddOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add parameter
          </Button>
        </div>
        <AddParameterDialog
          productSysId={productSysId}
          open={addOpen}
          onOpenChange={setAddOpen}
        />
      </>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {missingCount > 0 ? (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Missing {missingCount} required
            </Badge>
          ) : (
            <Badge variant="default">All required params filled</Badge>
          )}
          <span className="text-xs text-muted-foreground">{data.length} parameters</span>
          {dirtyCount > 0 && (
            <span className="text-xs text-orange-600">{dirtyCount} unsaved change(s)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add parameter
          </Button>
          <Button onClick={handleSave} disabled={dirtyCount === 0 || upsertM.isPending}>
            {upsertM.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save changes
          </Button>
        </div>
      </div>

      {grouped.map(([group, entries]) => (
        <Card key={group}>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">{group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entries.map((entry) => {
              const draft = drafts[entry.paramId]
              if (!draft) return null
              return (
                <ParamRow
                  key={entry.paramId}
                  entry={entry}
                  draft={draft}
                  onChange={patch}
                  onRemove={() => handleRemoveClick(entry)}
                  removing={removeM.isPending || previewLoading}
                  allEntries={data}
                  onLookupChange={handleLookupChange}
                />
              )
            })}
          </CardContent>
        </Card>
      ))}

      <AddParameterDialog
        productSysId={productSysId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      <ConfirmDialog
        open={!!removePreviewEntry}
        onOpenChange={(v) => {
          if (!v) {
            setRemovePreviewEntry(null)
            setRemovePreview(null)
          }
        }}
        title={`Remove ${removePreviewEntry?.paramName ?? ""}?`}
        description={
          removePreview?.children.length
            ? `This will also remove ${removePreview.children.length} child param(s): ${removePreview.children.map((c) => c.paramName).join(", ")}. Any filled values will be lost.`
            : "This parameter will be removed from this product."
        }
        confirmText="Remove All"
        variant="destructive"
        isLoading={previewLoading || removeInProgress}
        onConfirm={handleRemoveWithChildren}
      />
    </div>
  )
}

interface ParamRowProps {
  entry: RequiredParamEntry
  draft: DraftValue
  onRemove: () => void
  removing: boolean
  onChange: (paramId: string, p: Partial<DraftValue>) => void
  allEntries?: RequiredParamEntry[]
  onLookupChange?: (triggerParamId: string, selectedKey: string, fills: LookupFillValuesResponse | null) => void
}

function ParamRow({ entry, draft, onChange, onRemove, removing, allEntries, onLookupChange }: ParamRowProps) {
  return (
    <div className="grid grid-cols-12 gap-3 items-start">
      <div className="col-span-5">
        <Label className="text-sm font-medium flex items-center gap-2">
          {entry.paramName}
          {entry.isRequiredForCosting && (
            <span className="text-xs text-red-500 font-bold">*</span>
          )}
        </Label>
        <div className="text-xs text-muted-foreground space-y-0.5 mt-0.5">
          <div>
            <span className="font-mono">{entry.paramCode}</span>
            {entry.uomCode && <span> · {entry.uomCode}</span>}
            <span> · {entry.dataType}</span>
            {entry.lookupMasterCode && (
              <span className="text-amber-600"> · LOOKUP({entry.lookupMasterCode})</span>
            )}
          </div>
          {entry.ownerDepartment && (
            <div className="text-[10px] uppercase tracking-wide">
              Owner: {entry.ownerDepartment}
            </div>
          )}
        </div>
      </div>
      <div className="col-span-6">{renderValueInput(entry, draft, onChange, allEntries, onLookupChange)}</div>
      <div className="col-span-1 text-right">
        <Button
          size="icon"
          variant="ghost"
          title="Remove parameter from this product"
          disabled={removing}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}

function renderValueInput(
  entry: RequiredParamEntry,
  draft: DraftValue,
  onChange: (paramId: string, p: Partial<DraftValue>) => void,
  allEntries?: RequiredParamEntry[],
  onLookupChange?: (triggerParamId: string, selectedKey: string, fills: LookupFillValuesResponse | null) => void,
) {
  if (entry.paramCategory === "CALCULATED") {
    return (
      <div className="rounded border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        Calculated by engine — value is filled automatically during costing.
      </div>
    )
  }

  // Child params are auto-filled by their MASTER_LOOKUP trigger — render as read-only.
  if (entry.lookupFillGroupCode) {
    const displayValue = draft.valueNumeric || draft.valueText
    return (
      <div className="space-y-1">
        <div
          className={cn(
            "flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 text-sm",
            !displayValue ? "text-muted-foreground italic" : "",
          )}
        >
          {displayValue || "—"}
        </div>
        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <ArrowUp className="h-3 w-3" />
          auto-filled from{" "}
          <span className="font-mono font-medium">{entry.lookupFillGroupCode}</span>
        </p>
      </div>
    )
  }

  if (entry.lookupMasterCode) {
    if (onLookupChange && allEntries) {
      return (
        <MasterLookupField
          entry={entry}
          draft={draft}
          allEntries={allEntries}
          onChangeLookup={onLookupChange}
        />
      )
    }
    // Fallback (should not happen in practice)
    return (
      <Input
        value={draft.valueText}
        placeholder={`Select ${entry.lookupMasterCode}…`}
        onChange={(e) => onChange(entry.paramId, { valueText: e.target.value })}
      />
    )
  }

  switch (entry.dataType) {
    case "NUMBER":
      return (
        <Input
          type="number"
          step="any"
          value={draft.valueNumeric}
          onChange={(e) => onChange(entry.paramId, { valueNumeric: e.target.value })}
        />
      )
    case "TEXT":
      return (
        <Input
          value={draft.valueText}
          onChange={(e) => onChange(entry.paramId, { valueText: e.target.value })}
        />
      )
    case "BOOLEAN":
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={draft.valueFlag}
            onCheckedChange={(v) =>
              onChange(entry.paramId, { valueFlag: v, hasValueFlag: true })
            }
          />
          <span className="text-xs text-muted-foreground">
            {draft.valueFlag ? "TRUE" : "FALSE"}
          </span>
        </div>
      )
    default:
      return (
        <div className="text-xs text-red-600">Unsupported data_type: {entry.dataType}</div>
      )
  }
}
