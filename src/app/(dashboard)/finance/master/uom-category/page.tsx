import { generateMetadata as genMeta } from "@/config/site"
import UOMCategoryPageClient from "./uom-category-page-client"

export const metadata = genMeta("UOM Category")

export default function UOMCategoryPage() {
  return <UOMCategoryPageClient />
}
