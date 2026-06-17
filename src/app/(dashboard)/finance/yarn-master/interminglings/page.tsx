import type { Metadata } from "next"

import InterminglingPageClient from "./intermingling-page-client"

export const metadata: Metadata = { title: "Interminglings" }

export default function InterminglingPage() {
  return <InterminglingPageClient />
}
