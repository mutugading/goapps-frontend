import { generateMetadata as genMeta } from "@/config/site"
import BiLandingClient from "./landing-client"

export const metadata = genMeta("Executive Dashboards")

export default function BiLandingPage() {
  return <BiLandingClient />
}
