import { generateMetadata as genMeta } from "@/config/site"
import ProductRequestDetailClient from "./detail-client"

export const metadata = genMeta("Product Request")

export default async function ProductRequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>
}) {
  const { requestId } = await params
  return <ProductRequestDetailClient requestId={requestId} />
}
