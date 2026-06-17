import type { Metadata } from "next"

import MBSpinPageClient from "./mb-spin-page-client"

export const metadata: Metadata = { title: "MB Spins" }

export default function MBSpinPage() {
  return <MBSpinPageClient />
}
