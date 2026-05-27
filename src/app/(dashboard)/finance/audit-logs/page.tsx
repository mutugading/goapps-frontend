import { generateMetadata as genMeta } from "@/config/site"
import AuditLogsPageClient from "./audit-logs-page-client"

export const metadata = genMeta("Audit Logs")

export default function AuditLogsPage() {
  return <AuditLogsPageClient />
}
