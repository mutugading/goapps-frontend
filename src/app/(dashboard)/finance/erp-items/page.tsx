import { generateMetadata as genMeta } from "@/config/site"
import ErpItemsPageClient from "./erp-items-page-client"

export const metadata = genMeta("ERP Items")

export default function ErpItemsPage() {
  return <ErpItemsPageClient />
}
