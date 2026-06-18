import { generateMetadata as genMeta } from "@/config/site"
import ProductGradePageClient from "./product-grade-page-client"

export const metadata = genMeta("Product Grades")

export default function ProductGradesPage() {
  return <ProductGradePageClient />
}
