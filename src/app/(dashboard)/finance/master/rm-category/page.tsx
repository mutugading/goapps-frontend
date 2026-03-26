import { generateMetadata as genMeta } from "@/config/site"
import RMCategoryPageClient from "./rm-category-page-client"

export const metadata = genMeta("Raw Material Category")

export default function RMCategoryPage() {
  return <RMCategoryPageClient />
}
