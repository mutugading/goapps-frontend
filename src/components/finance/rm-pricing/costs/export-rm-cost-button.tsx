"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { requestRMCostExport, RequestExportParams } from "@/services/finance/rm-cost-export-api"

interface Props {
  // Filter state from the page (period required; search/group/rmType optional).
  filters: RequestExportParams
  disabled?: boolean
}

export function ExportRMCostButton({ filters, disabled }: Props) {
  const [pending, setPending] = useState(false)

  const mutation = useMutation({
    mutationFn: requestRMCostExport,
    onMutate: () => setPending(true),
    onSettled: () => setPending(false),
    onSuccess: (info) => {
      toast.success("Export dimulai", {
        description: `Job ${info.jobCode} sedang diproses. Anda akan dapat notifikasi saat siap diunduh.`,
      })
    },
    onError: (err: Error) => {
      toast.error("Gagal memulai export", { description: err.message })
    },
  })

  const handleClick = () => {
    if (!filters.period) {
      toast.warning("Pilih period dulu sebelum export.")
      return
    }
    mutation.mutate(filters)
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={disabled || pending || !filters.period}
    >
      <Download className="mr-2 h-4 w-4" />
      {pending ? "Menyusun…" : "Export"}
    </Button>
  )
}
