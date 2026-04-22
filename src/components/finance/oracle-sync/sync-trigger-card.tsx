"use client"

import { useState } from "react"
import { Play, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useTriggerSync } from "@/hooks/finance/use-oracle-sync"
import { formatPeriod } from "@/types/finance/oracle-sync"

export function SyncTriggerCard() {
  const [period, setPeriod] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const triggerMutation = useTriggerSync()

  const handleTrigger = () => {
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    setShowConfirm(false)
    await triggerMutation.mutateAsync(period || undefined)
    setPeriod("")
  }

  const displayPeriod = period || "auto-detect (current period)"

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Trigger Sync</CardTitle>
          <CardDescription>
            Manually trigger Oracle-to-PostgreSQL data synchronization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="period">Period (YYYYMM)</Label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="sm:flex-1 sm:max-w-xs">
                <Input
                  id="period"
                  placeholder="e.g. 202601 (leave empty for auto)"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]*"
                />
              </div>
              <Button
                onClick={handleTrigger}
                disabled={triggerMutation.isPending}
              >
                {triggerMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                Trigger Sync
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-detect based on current date
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sync Trigger</AlertDialogTitle>
            <AlertDialogDescription>
              This will start an Oracle data synchronization for period:{" "}
              <strong>{period ? formatPeriod(period) : displayPeriod}</strong>.
              The process may take several minutes to complete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
