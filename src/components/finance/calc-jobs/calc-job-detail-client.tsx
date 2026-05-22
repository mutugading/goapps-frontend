"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { PageHeader } from "@/components/common/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCalcJob } from "@/hooks/finance/use-cost-calc"

import { CalcJobHeader } from "./calc-job-header"
import { CalcJobAuditTab } from "./tabs/calc-job-audit-tab"
import { CalcJobChunksTab } from "./tabs/calc-job-chunks-tab"
import { CalcJobOverviewTab } from "./tabs/calc-job-overview-tab"
import { CalcJobProductsTab } from "./tabs/calc-job-products-tab"

interface Props {
  jobId: number
}

export function CalcJobDetailClient({ jobId }: Props) {
  const { data: job, isLoading, error } = useCalcJob(jobId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/finance/calc-jobs">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to calc jobs
          </Link>
        </Button>
        <div className="rounded border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Calc job not found.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 -ml-3">
          <Link href="/finance/calc-jobs">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to calc jobs
          </Link>
        </Button>
        <PageHeader
          title={`Job ${job.jobCode || `#${job.jobId}`}`}
          subtitle={`Period ${job.period} · ${job.calculationType} · ${job.scope.replace(/_/g, " ")}`}
        />
      </div>

      <CalcJobHeader job={job} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products ({job.totalProducts})</TabsTrigger>
          <TabsTrigger value="chunks">Chunks ({job.totalChunks})</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <CalcJobOverviewTab job={job} />
        </TabsContent>
        <TabsContent value="products" className="mt-4">
          <CalcJobProductsTab jobId={jobId} totalProducts={job.totalProducts} />
        </TabsContent>
        <TabsContent value="chunks" className="mt-4">
          <CalcJobChunksTab jobId={jobId} />
        </TabsContent>
        <TabsContent value="audit" className="mt-4">
          <CalcJobAuditTab jobId={jobId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
