import type { Metadata } from "next"

import BoxBobbinCostPageClient from "./box-bobbin-cost-page-client"

export const metadata: Metadata = { title: "Box/Bobbin Costs" }

export default function BoxBobbinCostPage() {
  return <BoxBobbinCostPageClient />
}
