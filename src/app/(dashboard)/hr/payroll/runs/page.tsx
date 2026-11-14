import { generateMetadata as genMeta } from "@/config/site"
import RunsPageClient from "./runs-page-client"

export const metadata = genMeta("Payroll Runs")

export default function PayrollRunsPage() {
  return <RunsPageClient />
}
