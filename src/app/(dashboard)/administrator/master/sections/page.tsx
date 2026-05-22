import { generateMetadata as genMeta } from "@/config/site"
import SectionsPageClient from "./sections-page-client"

export const metadata = genMeta("Sections")

export default function SectionsPage() {
    return <SectionsPageClient />
}
