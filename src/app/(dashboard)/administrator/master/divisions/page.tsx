import { generateMetadata as genMeta } from "@/config/site"
import DivisionsPageClient from "./divisions-page-client"

export const metadata = genMeta("Divisions")

export default function DivisionsPage() {
    return <DivisionsPageClient />
}
