import type { Metadata } from "next"
import MBHeadPageClient from "./mb-head-page-client"

export const metadata: Metadata = {
  title: "MB Heads",
}

export default function MBHeadPage() {
  return <MBHeadPageClient />
}
