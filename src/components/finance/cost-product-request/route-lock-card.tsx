"use client"

import { useState } from "react"
import { AlertTriangle, Lock, Unlock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserName } from "@/components/common/user-name"
import { useLockRoute, useUnlockRoute } from "@/hooks/finance/use-cost-route"
import { useParamSummary } from "@/hooks/finance/use-param-summary"
import type { CostRouteHead } from "@/types/finance/cost-route"
import { UnlockPasswordDialog } from "./unlock-password-dialog"

interface Props {
  head: CostRouteHead
  requestId: number
}

export function RouteLockCard({ head, requestId }: Props) {
  const [dialogAction, setDialogAction] = useState<"lock" | "unlock" | null>(null)
  const [passwordError, setPasswordError] = useState<string | undefined>()

  const lockM = useLockRoute()
  const unlockM = useUnlockRoute()
  const { data: summary } = useParamSummary(requestId)

  // head.routingStatus is "DRAFT" | "COMPLETE" | "LOCKED"
  const isLocked = head.routingStatus === "LOCKED"
  const isPending = lockM.isPending || unlockM.isPending

  const unfilledCount =
    summary !== undefined ? summary.totalParams - summary.filledParams : undefined

  const canLock = !isLocked && (unfilledCount === undefined || unfilledCount === 0)

  function handleConfirm(password: string) {
    setPasswordError(undefined)
    const mutate = dialogAction === "lock" ? lockM.mutate : unlockM.mutate
    mutate(
      { headId: head.headId, password },
      {
        onSuccess: () => setDialogAction(null),
        onError: (err: Error) => {
          const msg = err.message.toLowerCase()
          if (msg.includes("password") || msg.includes("invalid") || msg.includes("unauthorized")) {
            setPasswordError(err.message)
          } else {
            setDialogAction(null)
          }
        },
      },
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold">Route Lock</CardTitle>
          <Badge variant={isLocked ? "default" : "outline"} className="gap-1">
            {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
            {isLocked ? "LOCKED" : "UNLOCKED"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {isLocked ? (
            <>
              <div className="space-y-1">
                {head.lockedBy && (
                  <p className="text-muted-foreground">
                    Locked by:{" "}
                    <span className="font-medium text-foreground">
                      <UserName userId={head.lockedBy} compact />
                    </span>
                  </p>
                )}
                {head.lockedAt && (
                  <p className="text-muted-foreground">
                    Since:{" "}
                    <span className="font-medium text-foreground">
                      {head.lockedAt.slice(0, 16).replace("T", " ")} UTC
                    </span>
                  </p>
                )}
              </div>
              <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                Param values are read-only while locked.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPasswordError(undefined)
                  setDialogAction("unlock")
                }}
                disabled={isPending}
              >
                <Unlock className="mr-2 h-4 w-4" /> Unlock Route
              </Button>
            </>
          ) : (
            <>
              {head.lockedBy && (
                <p className="text-xs text-muted-foreground">
                  Last locked by <UserName userId={head.lockedBy} compact />
                  {head.unlockedAt ? ` · unlocked ${head.unlockedAt.slice(0, 10)}` : ""}
                </p>
              )}
              <p className="text-xs text-muted-foreground">Param values are currently editable.</p>
              {!canLock && unfilledCount !== undefined && unfilledCount > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {unfilledCount} param{unfilledCount > 1 ? "s" : ""} still empty — fill all before locking.
                </p>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="block">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setPasswordError(undefined)
                          setDialogAction("lock")
                        }}
                        disabled={isPending || !canLock}
                      >
                        <Lock className="mr-2 h-4 w-4" /> Lock Route
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canLock && unfilledCount !== undefined && unfilledCount > 0 && (
                    <TooltipContent>Fill all required params before locking.</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </CardContent>
      </Card>

      <UnlockPasswordDialog
        open={dialogAction !== null}
        onOpenChange={(v) => {
          if (!v) {
            setDialogAction(null)
            setPasswordError(undefined)
          }
        }}
        action={dialogAction ?? "lock"}
        isPending={isPending}
        onConfirm={handleConfirm}
        error={passwordError}
      />
    </>
  )
}
