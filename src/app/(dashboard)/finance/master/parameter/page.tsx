import { generateMetadata as genMeta } from "@/config/site"
import ParameterPageClient from "./parameter-page-client"

export const metadata = genMeta("Parameter")

export default function ParameterPage() {
  return <ParameterPageClient />
}
