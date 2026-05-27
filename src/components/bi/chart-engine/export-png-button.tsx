"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { toPng } from "html-to-image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface ExportPngButtonProps {
  /** Ref to the DOM node to capture (the chart card). */
  targetRef: React.RefObject<HTMLElement | null>
  /** Base filename (without extension). */
  fileName: string
}

/** Captures the referenced node as a PNG and triggers a download. */
export function ExportPngButton({ targetRef, fileName }: ExportPngButtonProps) {
  const [busy, setBusy] = useState(false)

  async function handleExport() {
    const node = targetRef.current
    if (!node) return
    setBusy(true)
    try {
      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: "#ffffff" })
      const link = document.createElement("a")
      link.download = `${fileName}.png`
      link.href = dataUrl
      link.click()
    } catch {
      toast.error("Failed to export PNG")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={busy}>
      <Download className="mr-1 h-4 w-4" />
      {busy ? "Exporting…" : "Export PNG"}
    </Button>
  )
}
