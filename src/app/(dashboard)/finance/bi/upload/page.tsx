import { generateMetadata as genMeta } from "@/config/site"
import { PageHeader } from "@/components/common/page-header"
import { ViewerEmptyState } from "@/components/bi/viewer/states"

export const metadata = genMeta("Upload Data")

export default function BiUploadStubPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Upload Data" subtitle="Excel upload for BI fact data" />
      <ViewerEmptyState message="Excel upload ships in a later phase. Use the seeded EBITDA dashboard to verify the data flow until then." />
    </div>
  )
}
