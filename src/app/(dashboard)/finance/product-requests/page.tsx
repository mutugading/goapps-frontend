import { generateMetadata as genMeta } from "@/config/site"
import ProductRequestsPageClient from "./product-requests-page-client"

export const metadata = genMeta("Product Requests")

export default function ProductRequestsPage() {
  return <ProductRequestsPageClient />
}
