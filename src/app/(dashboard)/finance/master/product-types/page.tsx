import { generateMetadata as genMeta } from "@/config/site"
import ProductTypePageClient from "./product-type-page-client"

export const metadata = genMeta("Product Types")

export default function ProductTypePage() {
  return <ProductTypePageClient />
}
