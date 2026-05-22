import { generateMetadata as genMeta } from "@/config/site"
import WorkflowTemplatePageClient from "./workflow-template-page-client"

export const metadata = genMeta("Workflow Templates")

export default function WorkflowTemplatePage() {
  return <WorkflowTemplatePageClient />
}
