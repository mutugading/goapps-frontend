import { notFound } from "next/navigation"

import { CostResultDetail } from "@/components/finance/cost-results/cost-result-detail"
import type { CalculationType } from "@/types/finance/cost-calc"

const VALID_CALC_TYPES: CalculationType[] = ["ACTUAL", "FORECAST", "SELLING"]

interface Props {
  params: Promise<{
    productSysId: string
    period: string
    calcType: string
  }>
}

export default async function CostResultDetailPage({ params }: Props) {
  const { productSysId, period, calcType } = await params

  const productSysIdNum = parseInt(productSysId, 10)
  if (isNaN(productSysIdNum)) notFound()

  const upperCalcType = calcType.toUpperCase() as CalculationType
  if (!VALID_CALC_TYPES.includes(upperCalcType)) notFound()

  return (
    <CostResultDetail
      productSysId={productSysIdNum}
      period={period}
      calcType={upperCalcType}
    />
  )
}
