"use client"

import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCostProductMaster } from "@/hooks/finance/use-cost-product-master"
import { CalculateButton } from "@/components/finance/calc-jobs/calculate-button"
import { ProductParametersTab } from "@/components/finance/cost-product-master/parameters-tab"
import { CostHistoryTab } from "@/components/finance/cost-results/cost-history-tab"
import { ProductTypeName } from "@/components/common/product-type-name"

interface Props {
  productSysId: number
}

export default function ProductMasterDetailClient({ productSysId }: Props) {
  const { data: product, isLoading } = useCostProductMaster(productSysId)

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/finance/product-master">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to product list
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          title={
            isLoading
              ? "Loading…"
              : product
                ? `${product.productCode} — ${product.productName}`
                : "Product not found"
          }
          subtitle={
            product
              ? `${product.productTypeName || product.productTypeCode || ""} · ${product.shadeCode || "—"} / ${product.gradeCode || "—"}`
              : undefined
          }
        />
        {product && <CalculateButton productSysId={productSysId} label="Calculate cost" />}
      </div>

      {product && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Identity
              {!product.isActive && <Badge variant="secondary">Inactive</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Field label="Code" value={product.productCode} mono />
            <Field label="Name" value={product.productName} />
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Type</div>
              <div className="text-sm">
                {product.productTypeName || product.productTypeCode ? (
                  `${product.productTypeCode || ""} ${product.productTypeName ? `— ${product.productTypeName}` : ""}`
                ) : (
                  <ProductTypeName id={product.productTypeId} />
                )}
              </div>
            </div>
            <Field label="Shade" value={product.shadeCode || "—"} />
            <Field label="Grade" value={product.gradeCode || "—"} />
            <Field label="ERP item" value={product.erpItemCode || "—"} mono />
            <Field label="ERP grade 1" value={product.erpGradeCode1 || "—"} mono />
            <Field label="ERP grade 2" value={product.erpGradeCode2 || "—"} mono />
            {product.description && (
              <div className="col-span-full">
                <Field label="Description" value={product.description} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="parameters">
        <TabsList>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="cost-history">Cost history</TabsTrigger>
          <TabsTrigger value="bom" disabled>
            BOM / Routing (S7.5+)
          </TabsTrigger>
          <TabsTrigger value="audit" disabled>
            Audit (S7.5+)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="parameters" className="mt-4">
          <ProductParametersTab productSysId={productSysId} />
        </TabsContent>
        <TabsContent value="cost-history" className="mt-4">
          <CostHistoryTab productSysId={productSysId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-sm" : "text-sm"}>{value}</div>
    </div>
  )
}
