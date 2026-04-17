import { generateMetadata as genMeta } from "@/config/site"
import OracleSyncPageClient from "./oracle-sync-page-client"

export const metadata = genMeta("Oracle Sync")

export default function OracleSyncPage() {
  return <OracleSyncPageClient />
}
