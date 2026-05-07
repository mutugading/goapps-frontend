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
      toast.success("Export started", {
        description: `Job ${info.jobCode} is being processed. You will receive a notification when it's ready to download.`,
      })
    },
    onError: (err: Error) => {
      toast.error("Failed to start export", { description: err.message })
    },
  })

  const handleClick = () => {
    if (!filters.period) {
      toast.warning("Please select a period before exporting.")
      return
    }
    mutation.mutate(filters)
  }

  return (
    <Button
      variant="outline"
      className="cursor-pointer"
      onClick={handleClick}
      disabled={disabled || pending || !filters.period}
    >
      <Download className="mr-2 h-4 w-4" />
      {pending ? "Preparing…" : "Export"}
    </Button>
  )
}
