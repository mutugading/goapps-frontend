import { generateMetadata as genMeta } from "@/config/site"
import { CalcJobsPageClient } from "@/components/finance/calc-jobs/calc-jobs-page-client"

export const metadata = genMeta("Calc Jobs")

export default function CalcJobsPage() {
  return <CalcJobsPageClient />
}
