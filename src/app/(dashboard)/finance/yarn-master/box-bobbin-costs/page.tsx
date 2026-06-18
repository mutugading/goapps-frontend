import { generateMetadata as genMeta } from "@/config/site"
import BoxBobbinCostPageClient from "./box-bobbin-cost-page-client"

export const metadata = genMeta("Box/Bobbin Costs")

export default function BoxBobbinCostPage() {
  return <BoxBobbinCostPageClient />
}
