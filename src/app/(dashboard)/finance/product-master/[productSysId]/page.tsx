import ProductMasterDetailClient from "./detail-client"

export default async function ProductMasterDetailPage({
  params,
}: {
  params: Promise<{ productSysId: string }>
}) {
  const { productSysId } = await params
  return <ProductMasterDetailClient productSysId={Number(productSysId)} />
}
