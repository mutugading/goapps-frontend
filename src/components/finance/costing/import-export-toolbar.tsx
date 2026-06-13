"use client"

import { useState } from "react"
import { Download, FileDown, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  useDownloadTemplate,
  useExportData,
} from "@/hooks/finance/use-cost-import"
import type { ImportEntity } from "@/types/finance/cost-import"
import { ImportDialog } from "./import-dialog"

interface ImportExportToolbarProps {
  entity: ImportEntity
  onImportSuccess: () => void
  exportParams?: Record<string, string>
  hideExport?: boolean
}

export function ImportExportToolbar({
  entity,
  onImportSuccess,
  exportParams,
  hideExport = false,
}: ImportExportToolbarProps) {
  const [importOpen, setImportOpen] = useState(false)
  const { download, loading: templateLoading } = useDownloadTemplate()
  const { exportEntity, loading: exportLoading } = useExportData()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={templateLoading}
        onClick={() => download(entity)}
      >
        <FileDown className="mr-2 h-4 w-4" />
        Template
      </Button>

      {!hideExport && (
        <Button
          variant="outline"
          size="sm"
          disabled={exportLoading}
          onClick={() => exportEntity(entity, exportParams)}
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      )}

      <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Import
      </Button>

      <ImportDialog
        entity={entity}
        open={importOpen}
        onOpenChange={setImportOpen}
        onSuccess={onImportSuccess}
      />
    </div>
  )
}
