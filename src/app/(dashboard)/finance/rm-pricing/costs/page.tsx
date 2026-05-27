import { generateMetadata as genMeta } from "@/config/site"
import RMCostsPageClient from "./rm-costs-page-client"

export const metadata = genMeta("RM Costs")

export default function RMCostsPage() {
  return <RMCostsPageClient />
}
