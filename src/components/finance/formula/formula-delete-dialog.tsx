"use client"

import { ConfirmDialog } from "@/components/shared"
import type { Formula } from "@/types/finance/formula"
import { useDeleteFormula } from "@/hooks/finance/use-formula"

interface FormulaDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formula: Formula | null
  onSuccess?: () => void
}

export function FormulaDeleteDialog({
  open,
  onOpenChange,
  formula,
  onSuccess,
}: FormulaDeleteDialogProps) {
  const deleteMutation = useDeleteFormula()

  const handleDelete = async () => {
    if (!formula) return

    try {
      await deleteMutation.mutateAsync(formula.formulaId)
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to delete formula:", error)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Formula"
      description={`Are you sure you want to delete the formula "${formula?.formulaCode}" (${formula?.formulaName})? This action cannot be undone.`}
      variant="destructive"
      isLoading={deleteMutation.isPending}
      confirmText="Delete"
      onConfirm={handleDelete}
    />
  )
}
