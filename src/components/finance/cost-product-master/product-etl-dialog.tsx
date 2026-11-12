"use client"

// ProductEtlDialog — preview Oracle legacy products and apply selected rows.
// Rules: nothing pre-checked, non-selectable rows disabled, selection capped at applyLimit.
import Link from "next/link"
import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  ScrollableDialogBody, ScrollableDialogContent, ScrollableDialogFooter, ScrollableDialogHeader,
} from "@/components/common/scrollable-dialog"
import { useApplyProductEtl, usePreviewProductEtl } from "@/hooks/finance/use-cost-product-master"
import { EtlError } from "@/services/finance/cost-product-master-mb-api"
import {
  ETL_STATUS_LABELS, type EtlRowStatus, type NormalizedEtlApplyResult, type NormalizedEtlPreview,
} from "@/types/finance/cost-product-master"

function firstOfMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductEtlDialog({ open, onOpenChange }: Props) {
  const preview = usePreviewProductEtl()
  const apply = useApplyProductEtl()
  const [fromDate, setFromDate] = useState(firstOfMonth)
  const [search, setSearch] = useState("")
  const [includeExisting, setIncludeExisting] = useState(false)
  const [data, setData] = useState<NormalizedEtlPreview | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<NormalizedEtlApplyResult | null>(null)
  const [error, setError] = useState<{ code: number; message: string } | null>(null)
  const [confirming, setConfirming] = useState(false)

  const limit = data?.applyLimit ?? 0
  const selectableRows = useMemo(() => (data?.rows ?? []).filter((r) => r.selectable), [data])
  const count = selected.size
  const overLimit = limit > 0 && count > limit
  const canApply = count > 0 && !overLimit && !apply.isPending

  function toErr(e: unknown) {
    if (e instanceof EtlError) return { code: e.statusCode, message: e.message }
    return { code: 0, message: e instanceof Error ? e.message : "Unexpected error" }
  }

  async function runPreview() {
    setError(null)
    setResult(null)
    setConfirming(false)
    try {
      const p = await preview.mutateAsync({ fromDate, search, includeExisting })
      setData(p)
      setSelected(new Set()) // nothing pre-checked
    } catch (e) {
      setData(null)
      setError(toErr(e))
    }
  }

  function toggle(key: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) {
        if (limit > 0 && next.size >= limit) return prev
        next.add(key)
      } else next.delete(key)
      return next
    })
  }

  function selectAll() {
    const keys = selectableRows.map((r) => r.rowKey)
    setSelected(new Set(limit > 0 ? keys.slice(0, limit) : keys))
  }

  async function runApply() {
    if (!data) return
    setError(null)
    try {
      const r = await apply.mutateAsync({ previewRunId: data.runId, rowKeys: Array.from(selected) })
      setResult(r)
      setConfirming(false)
    } catch (e) {
      const err = toErr(e)
      setConfirming(false)
      setError(err.code === 404 ? { code: 404, message: "Preview expired, run preview again." } : err)
    }
  }

  function close(o: boolean) {
    if (!o) {
      setData(null); setSelected(new Set()); setResult(null); setError(null); setConfirming(false)
    }
    onOpenChange(o)
  }

  const counts = data?.counts

  return (
    <Dialog open={open} onOpenChange={close}>
      <ScrollableDialogContent className="sm:max-w-4xl">
        <ScrollableDialogHeader>
          <DialogTitle>Sync from Oracle</DialogTitle>
          <DialogDescription>Preview legacy Oracle items and create selected ones as products.</DialogDescription>
        </ScrollableDialogHeader>
        <ScrollableDialogBody className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[160px_1fr_auto] sm:items-end">
            <div className="space-y-1">
              <Label htmlFor="etl-from-date">From date *</Label>
              <Input id="etl-from-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="etl-search">Search</Label>
              <Input id="etl-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Item / shade" />
            </div>
            <div className="flex items-center gap-2 pb-2">
              <Switch id="etl-include-existing" checked={includeExisting} onCheckedChange={setIncludeExisting} />
              <Label htmlFor="etl-include-existing">Include existing</Label>
            </div>
          </div>
          <Button onClick={runPreview} disabled={!fromDate || preview.isPending}>
            {preview.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Preview
          </Button>

          {error && (
            <Alert variant="destructive" role="alert">
              <AlertTitle>{error.code === 503 ? "Oracle ERP connection is not available" : "Request failed"}</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-2" data-testid="etl-result">
              <p className="text-sm font-medium">
                Inserted {result.inserted}, skipped {result.skipped}, failed {result.failed}
              </p>
              <ul className="space-y-1 text-sm">
                {result.rows.map((r) => (
                  <li key={r.rowKey} className="flex flex-wrap gap-2">
                    <Badge variant={r.result === "FAILED" ? "destructive" : "secondary"}>{r.result}</Badge>
                    <span className="font-mono">{r.rowKey}</span>
                    {r.productSysId > 0 && (
                      <Link className="text-primary hover:underline" href={`/finance/product-master/${r.productSysId}`}>
                        {r.productCode || r.productSysId}
                      </Link>
                    )}
                    {r.message && <span className="text-muted-foreground">{r.message}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data && !result && counts && (
            <>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline">Total {counts.total}</Badge>
                <Badge variant="outline">New item {counts.newItem}</Badge>
                <Badge variant="outline">New shade {counts.newShade}</Badge>
                <Badge variant="outline">Exists {counts.exists + counts.existsMulti}</Badge>
                <Badge variant="outline">Possible duplicate {counts.possibleDuplicate}</Badge>
                <Badge variant="outline">Invalid type {counts.invalidType}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span data-testid="etl-selected-count" className={overLimit ? "text-destructive" : ""}>
                  {count} / {limit} selected
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={selectAll} disabled={selectableRows.length === 0}>
                    Select all selectable
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelected(new Set())} disabled={count === 0}>
                    Clear
                  </Button>
                </div>
              </div>
              {data.rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rows found.</p>
              ) : (
                <div className="overflow-x-auto rounded border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="w-8 p-2" />
                        <th className="p-2">Item (Orion)</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Shade</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.rows.map((row) => (
                        <tr key={row.rowKey} className="border-t">
                          <td className="p-2">
                            <Checkbox
                              aria-label={`Select ${row.rowKey}`}
                              checked={selected.has(row.rowKey)}
                              disabled={!row.selectable}
                              onCheckedChange={(v) => toggle(row.rowKey, v === true)}
                            />
                          </td>
                          <td className="p-2 font-mono">{row.mergeItemOrion}</td>
                          <td className="p-2">{row.itemName}</td>
                          <td className="p-2">{row.shadeCode}{row.shadeName ? ` — ${row.shadeName}` : ""}</td>
                          <td className="p-2">{row.typeCode}</td>
                          <td className="p-2">
                            <Badge variant={row.selectable ? "default" : "outline"} title={row.note || undefined}>
                              {ETL_STATUS_LABELS[row.status as EtlRowStatus] ?? row.status}
                            </Badge>
                            {row.note && <span className="ml-2 text-xs text-muted-foreground">{row.note}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {confirming && (
                <Alert>
                  <AlertTitle>Apply {count} row(s)?</AlertTitle>
                  <AlertDescription>The selected rows will be created as products in Cost master.</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </ScrollableDialogBody>
        <ScrollableDialogFooter>
          <Button variant="outline" onClick={() => close(false)}>{result ? "Close" : "Cancel"}</Button>
          {data && !result && (
            confirming ? (
              <Button onClick={runApply} disabled={!canApply}>
                {apply.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm apply
              </Button>
            ) : (
              <Button onClick={() => setConfirming(true)} disabled={!canApply}>Apply</Button>
            )
          )}
        </ScrollableDialogFooter>
      </ScrollableDialogContent>
    </Dialog>
  )
}
