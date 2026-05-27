// BI Upload — summary KPI cards for a parsed/committed upload preview.

import { CheckCircle2, FileSpreadsheet, RefreshCw, XCircle } from "lucide-react"

import { KpiCard } from "@/components/common/kpi-card"
import type { NormalizedUpload } from "@/types/bi"

export interface UploadSummaryProps {
  upload: NormalizedUpload
}

export function UploadSummary({ upload }: UploadSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <KpiCard title="Total Rows" value={upload.totalRows} icon={FileSpreadsheet} />
      <KpiCard title="Valid Rows" value={upload.validRows} icon={CheckCircle2} variant="success" />
      <KpiCard
        title="Invalid Rows"
        value={upload.invalidRows}
        icon={XCircle}
        variant={upload.invalidRows > 0 ? "destructive" : "default"}
      />
      <KpiCard
        title="Will Overwrite"
        value={upload.validRows}
        icon={RefreshCw}
        variant="warning"
      />
    </div>
  )
}
