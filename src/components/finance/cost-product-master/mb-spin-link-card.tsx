"use client"

// MbSpinLinkCard — shows how a product is linked to an MB Spin (FG match / shade only / Superba)
// and lets a permitted user force a re-link. Hidden without finance.product.route.view.
import Link from "next/link"
import { useState } from "react"
import { AlertTriangle, Link2, Loader2, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useCostProductMbLink, useRelinkCostProductMb } from "@/hooks/finance/use-cost-product-master"
import { usePermissionContext } from "@/providers/permission-provider"
import { MB_LINK_SOURCE_LABELS, type MbLinkSource } from "@/types/finance/cost-product-master"

const VIEW_PERMISSION = "finance.product.route.view"
const UPDATE_PERMISSION = "finance.product.route.update"

interface Props {
  productSysId: number
}

export function MbSpinLinkCard({ productSysId }: Props) {
  const { hasPermission } = usePermissionContext()
  if (!hasPermission(VIEW_PERMISSION)) return null
  return <Content productSysId={productSysId} canRelink={hasPermission(UPDATE_PERMISSION)} />
}

function Content({ productSysId, canRelink }: { productSysId: number; canRelink: boolean }) {
  const { data: link, isLoading, isError, error } = useCostProductMbLink(productSysId)
  const relink = useRelinkCostProductMb()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const source = link?.linkSource ?? "NONE"
  const label = MB_LINK_SOURCE_LABELS[source as MbLinkSource] ?? source
  const variant = source === "FG_MATCH" ? "default" : source === "NONE" ? "outline" : "secondary"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="h-4 w-4" /> MB Spin link
        </CardTitle>
        {canRelink && (
          <Button size="sm" variant="outline" onClick={() => setConfirmOpen(true)} disabled={relink.isPending}>
            {relink.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Re-link MB
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading || isError || !link ? (
          <p className={isError ? "text-destructive" : "text-muted-foreground"}>
            {isLoading ? "Loading…" : isError ? (error as Error)?.message || "Failed to load link information." : "No link information."}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={variant} data-testid="mb-link-source">{label}</Badge>
              {link.spinId && (
                <Link className="font-mono text-primary hover:underline" href={`/finance/yarn-master/mb-spins/${link.spinId}`}>
                  {link.spinCode || link.spinId}
                </Link>
              )}
              {link.spinShadeCode && <span className="text-muted-foreground">shade {link.spinShadeCode}</span>}
            </div>
            {link.fgProductCode && (
              <p><span className="text-muted-foreground">FG product: </span><span className="font-mono">{link.fgProductCode}</span></p>
            )}
            {link.reason && <p className="text-muted-foreground">{link.reason}</p>}
            <p>
              <span className="text-muted-foreground">Current MB_SP_CODE: </span>
              <span className="font-mono">{link.currentParamValue || "—"}</span>
            </p>
            {!link.paramMatches && source !== "NONE" && (
              <p className="flex items-center gap-1 text-amber-600" role="alert">
                <AlertTriangle className="h-4 w-4" />
                Parameter value does not match the linked spin. Use Re-link MB to fix.
              </p>
            )}
            {link.candidatePoyProductIds.length > 1 && (
              <div>
                <p className="text-muted-foreground">Ambiguous POY candidates:</p>
                <ul className="list-disc pl-5">
                  {link.candidatePoyProductIds.map((id) => (
                    <li key={id}>
                      <Link className="text-primary hover:underline" href={`/finance/product-master/${id}`}>#{id}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Re-link MB?</AlertDialogTitle>
            <AlertDialogDescription>
              This recomputes the MB spin link and refills the MB parameters of this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => relink.mutate(productSysId)}>Re-link</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
