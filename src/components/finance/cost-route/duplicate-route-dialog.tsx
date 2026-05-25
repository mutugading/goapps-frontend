"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDuplicateRoute } from "@/hooks/finance/use-duplicate-route"

interface Props {
  open: boolean
  onClose: () => void
  sourceHeadId: number
  sourceProductCode?: string
  /**
   * When set, the backend atomically re-links the request to the new fork.
   */
  linkedRequestId?: number
}

export function DuplicateRouteDialog({
  open,
  onClose,
  sourceHeadId,
  sourceProductCode,
  linkedRequestId,
}: Props) {
  const router = useRouter()
  const [includeRouting, setIncludeRouting] = useState(true)
  const [includeUpstream, setIncludeUpstream] = useState(true)
  const [includeApplicability, setIncludeApplicability] = useState(true)
  const [includeValues, setIncludeValues] = useState(true)
  const [newCodePrefix, setNewCodePrefix] = useState("")
  const dupM = useDuplicateRoute()

  // Values require applicability ON — derive instead of syncing via an effect.
  const effectiveIncludeValues = includeApplicability && includeValues

  const handleSubmit = async () => {
    const res = await dupM.mutateAsync({
      headId: sourceHeadId,
      includeRouting,
      includeUpstream,
      includeApplicability,
      includeValues: effectiveIncludeValues,
      newCodePrefix: newCodePrefix || undefined,
      linkedRequestId,
    })
    onClose()
    router.push(`/finance/routes/${res.newHeadId}`)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Duplicate {sourceProductCode ?? `route #${sourceHeadId}`}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">Choose what to copy. Defaults = full deep copy.</p>

          <div className="flex items-start gap-2">
            <Checkbox
              id="t-routing"
              checked={includeRouting}
              onCheckedChange={(v) => setIncludeRouting(!!v)}
            />
            <div>
              <Label htmlFor="t-routing">Routing graph (stages + RMs)</Label>
              <p className="text-xs text-muted-foreground">
                OFF → new head starts empty; user builds from scratch.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="t-upstream"
              checked={includeUpstream}
              onCheckedChange={(v) => setIncludeUpstream(!!v)}
              disabled={!includeRouting}
            />
            <div>
              <Label htmlFor="t-upstream">Upstream products (recursive)</Label>
              <p className="text-xs text-muted-foreground">
                OFF → forked RMs reference the ORIGINAL upstream products (shared).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="t-applic"
              checked={includeApplicability}
              onCheckedChange={(v) => setIncludeApplicability(!!v)}
            />
            <div>
              <Label htmlFor="t-applic">CAPP applicability (param links)</Label>
              <p className="text-xs text-muted-foreground">
                OFF → forked products have no params declared.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="t-values"
              checked={effectiveIncludeValues}
              onCheckedChange={(v) => setIncludeValues(!!v)}
              disabled={!includeApplicability}
            />
            <div>
              <Label htmlFor="t-values">CAPP values (numeric / text)</Label>
              <p className="text-xs text-muted-foreground">
                OFF → params declared but values are NULL (user fills).
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="t-prefix">New code prefix (optional)</Label>
            <Input
              id="t-prefix"
              value={newCodePrefix}
              onChange={(e) => setNewCodePrefix(e.target.value)}
              placeholder="e.g. CSTPTY26V2 (defaults to {source}_F)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={dupM.isPending}>
            {dupM.isPending ? "Duplicating…" : "Duplicate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
