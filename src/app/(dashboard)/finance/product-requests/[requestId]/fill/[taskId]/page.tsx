import { generateMetadata as genMeta } from "@/config/site"
import { FillParamEntryPage } from "@/components/finance/fill-assignment/FillParamEntryPage"

export const metadata = genMeta("Fill Parameters")

export default async function FillTaskPage({
  params,
}: {
  params: Promise<{ requestId: string; taskId: string }>
}) {
  const { requestId, taskId } = await params
  return <FillParamEntryPage requestId={Number(requestId)} taskId={Number(taskId)} />
}
