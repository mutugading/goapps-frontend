import { generateMetadata as genMeta } from "@/config/site"
import { CostResultsPageClient } from "@/components/finance/cost-results/cost-results-page-client"

export const metadata = genMeta("Cost Results")

export const dynamic = "force-dynamic"

export default function CostResultsPage() {
  return <CostResultsPageClient />
}
