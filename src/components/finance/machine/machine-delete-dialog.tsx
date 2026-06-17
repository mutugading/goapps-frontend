"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Machine } from "@/types/finance/machine"
import { useDeleteMachine } from "@/hooks/finance/use-machine"

interface MachineDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  machine: Machine | null
  onSuccess?: () => void
}

export function MachineDeleteDialog({
  open,
  onOpenChange,
  machine,
  onSuccess,
}: MachineDeleteDialogProps) {
  const deleteMutation = useDeleteMachine()

  const handleDelete = async () => {
    if (!machine) return

    try {
      await deleteMutation.mutateAsync(String(machine.machineId))
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete machine:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Machine"
      description={`Are you sure you want to delete the machine "${machine?.machineCode}" (${machine?.machineName})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
