import { generateMetadata as genMeta } from "@/config/site"
import EmployeeGroupPageClient from "./employee-group-page-client"

export const metadata = genMeta("Employee Groups")

export default function EmployeeGroupPage() {
  return <EmployeeGroupPageClient />
}
