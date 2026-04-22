import { generateMetadata as genMeta } from "@/config/site"
import GroupDetailPageClient from "./group-detail-page-client"

export const metadata = genMeta("RM Group Detail")

export default function GroupDetailPage() {
  return <GroupDetailPageClient />
}
