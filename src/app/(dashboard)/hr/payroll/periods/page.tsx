import { generateMetadata as genMeta } from "@/config/site"
import PeriodsPageClient from "./periods-page-client"

export const metadata = genMeta("Payroll Periods")

export default function PayrollPeriodsPage() {
  return <PeriodsPageClient />
}
