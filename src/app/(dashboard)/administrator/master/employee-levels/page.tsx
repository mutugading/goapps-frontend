import { generateMetadata as genMeta } from "@/config/site"
import EmployeeLevelPageClient from "./employee-level-page-client"

export const metadata = genMeta("Employee Levels")

export default function EmployeeLevelPage() {
  return <EmployeeLevelPageClient />
}
