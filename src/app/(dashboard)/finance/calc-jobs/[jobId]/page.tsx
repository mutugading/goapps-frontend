import { CalcJobDetailClient } from "@/components/finance/calc-jobs/calc-job-detail-client"

interface Props {
  params: Promise<{ jobId: string }>
}

export default async function CalcJobDetailPage({ params }: Props) {
  const { jobId } = await params
  return <CalcJobDetailClient jobId={Number(jobId)} />
}

export const dynamic = "force-dynamic"
