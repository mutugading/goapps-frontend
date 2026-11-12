"use client"

// MbSupersedeConfirmDialog — shown when Approve/Validate hits the 409
// SUPERSEDE_CONFIRMATION_REQUIRED gate. Loads the read-only preview, lets the user
// Cancel (no request) or "Replace & Validate" (validate with confirmSupersede:true).
import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePermissionContext } from "@/providers/permission-provider"
import { useMBHeadSupersedePreview, useValidateMBHead } from "@/hooks/finance/use-mb-head"
import { isSupersedeConfirmationRequiredError } from "@/services/finance/mb-head-api"

interface Props {
  open: boolean
  mbhId: string
  onOpenChange: (open: boolean) => void
}

export function MbSupersedeConfirmDialog({ open, mbhId, onOpenChange }: Props) {
  const { hasPermission } = usePermissionContext()
  const canValidate = hasPermission("finance.mb.head.validate")
  const previewQ = useMBHeadSupersedePreview(mbhId, open)
  const validateM = useValidateMBHead()
  const candidates = previewQ.data?.candidates ?? []

  const [confirmError, setConfirmError] = useState<string | null>(null)

  const confirm = () => {
    setConfirmError(null)
    validateM.mutate(
      { mbhId, confirmSupersede: true },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) => {
          if (isSupersedeConfirmationRequiredError(err)) {
            previewQ.refetch()
            setConfirmError("Conflicts changed — review and confirm again.")
          } else {
            setConfirmError(err.message || "Failed to validate MB Head")
          }
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !validateM.isPending && onOpenChange(o)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Replace existing MB Spin?</DialogTitle>
          <DialogDescription>
            Validating this recipe supersedes the spin(s) below. Product parameters pointing at them
            are repointed to the new spin. This is reversible via Un-supersede on MB Spin.
          </DialogDescription>
        </DialogHeader>

        {previewQ.isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading preview...
          </div>
        )}
        {previewQ.isError && (
          <Alert variant="destructive">
            <AlertDescription>{(previewQ.error as Error)?.message || "Failed to load preview"}</AlertDescription>
          </Alert>
        )}

        {confirmError && (
          <Alert variant="destructive">
            <AlertDescription>{confirmError}</AlertDescription>
          </Alert>
        )}

        {candidates.map((c) => (
          <div key={c.oldSpinId} className="space-y-2 rounded-md border p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-medium">{c.oldSpinCode}</span>
              <Badge variant="outline">Shade {c.shadeCode || "—"}</Badge>
              <Badge variant="outline">FG {c.fgProductCode || "—"}</Badge>
            </div>
            <div className="text-muted-foreground">
              Old recipe <span className="font-mono">{c.oldHeadCode || "—"}</span>
              {c.oldHeadWillDeactivate ? " will be deactivated" : " stays active"}; old product{" "}
              {c.oldMbProductWillDeactivate ? "will be deactivated" : "stays active"}.
            </div>
            <div data-testid="repoint-count">
              <span className="font-medium">{c.paramRowsTotal} params will be repointed</span>{" "}
              ({c.paramRowsPointer} pointer + {c.paramRowsTextOnly} text-only)
            </div>
            {c.filledByCounts.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {c.filledByCounts.map((f) => (
                  <Badge key={f.filledBy} variant="secondary">
                    {f.filledBy}: {f.count}
                  </Badge>
                ))}
              </div>
            )}
            {c.affectedProducts.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="link" size="sm" className="h-auto p-0">
                    Show {c.affectedProducts.length} affected products
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto text-xs">
                    {c.affectedProducts.map((p) => (
                      <li key={`${p.productSysId}-${p.filledBy}`}>
                        <span className="font-mono">{p.productCode}</span> {p.productName}{" "}
                        <span className="text-muted-foreground">({p.filledBy})</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            )}
            {c.warnings.map((w) => (
              <Alert key={w}>
                <AlertDescription className="text-xs">{w}</AlertDescription>
              </Alert>
            ))}
          </div>
        ))}

        <DialogFooter>
          <Button variant="outline" disabled={validateM.isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {!canValidate && (
            <span className="text-muted-foreground self-center text-xs">
              Requires finance.mb.head.validate permission
            </span>
          )}
          <Button
            disabled={!canValidate || validateM.isPending || previewQ.isLoading || previewQ.isError}
            onClick={confirm}
          >
            {validateM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Replace &amp; Validate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
