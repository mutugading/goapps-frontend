import { generateMetadata as genMeta } from "@/config/site"
import { PageHeader } from "@/components/common/page-header"
import { UploadPageClient } from "@/components/bi/upload/upload-page-client"

export const metadata = genMeta("Upload Data")

export default function BiUploadPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Upload Data" subtitle="Excel upload for BI fact data" />
      <UploadPageClient />
    </div>
  )
}
