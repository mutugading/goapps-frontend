import { generateMetadata as genMeta } from "@/config/site"
import RoutingRulesPageClient from "./routing-rules-page-client"

export const metadata = genMeta("Routing Rules")

export default function RoutingRulesPage() {
  return <RoutingRulesPageClient />
}
