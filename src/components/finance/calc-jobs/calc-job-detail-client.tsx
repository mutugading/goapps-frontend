"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/common/empty-state"
import { PageHeader } from "@/components/common/page-header"
import { useCalcJob } from "@/hooks/finance/use-cost-calc"

import { CalcJobHeader } from "./calc-job-header"
import { CalcJobAuditTab } from "./tabs/calc-job-audit-tab"
import { CalcJobChunksTab } from "./tabs/calc-job-chunks-tab"
import { CalcJobOverviewTab } from "./tabs/calc-job-overview-tab"
import { CalcJobProductsTab } from "./tabs/calc-job-products-tab"

interface Props {
  jobId: number
}

function humanize(s: string) {
  return s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

export function CalcJobDetailClient({ jobId }: Props) {
  const { data: job, isLoading, error } = useCalcJob(jobId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-80" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="space-y-6">
        <PageHeader title="Calc Job">
          <Button asChild variant="outline">
            <Link href="/finance/calc-jobs">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to calc jobs
            </Link>
          </Button>
        </PageHeader>
        <EmptyState
          title="Job not found"
          description={`No calc job with ID ${jobId}.`}
          action={
            <Button asChild variant="outline">
              <Link href="/finance/calc-jobs">Back to list</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.jobCode || `Job #${job.jobId}`}
        subtitle={`Period ${job.period} · ${humanize(job.calculationType)} · ${humanize(job.scope)}`}
      >
        <Button asChild variant="outline">
          <Link href="/finance/calc-jobs">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to calc jobs
          </Link>
        </Button>
      </PageHeader>

      <CalcJobHeader job={job} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">
            Products{job.totalProducts > 0 ? ` (${job.totalProducts})` : ""}
          </TabsTrigger>
          <TabsTrigger value="chunks">
            Chunks{job.totalChunks > 0 ? ` (${job.totalChunks})` : ""}
          </TabsTrigger>
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
