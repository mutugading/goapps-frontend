import { generateMetadata as genMeta } from "@/config/site"
import RMGroupsPageClient from "./rm-groups-page-client"

export const metadata = genMeta("RM Groups")

export default function RMGroupsPage() {
  return <RMGroupsPageClient />
}
