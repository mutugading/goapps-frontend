import { generateMetadata as genMeta } from "@/config/site"
import ProductMasterPageClient from "./product-master-page-client"

export const metadata = genMeta("Product Master")

export default function ProductMasterPage() {
  return <ProductMasterPageClient />
}
