import { generateMetadata as genMeta } from "@/config/site"
import DepartmentsPageClient from "./departments-page-client"

export const metadata = genMeta("Departments")

export default function DepartmentsPage() {
    return <DepartmentsPageClient />
}
