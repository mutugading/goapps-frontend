import { generateMetadata as genMeta } from "@/config/site"
import MachinePageClient from "./machine-page-client"

export const metadata = genMeta("Machines")

export default function MachinePage() {
  return <MachinePageClient />
}
