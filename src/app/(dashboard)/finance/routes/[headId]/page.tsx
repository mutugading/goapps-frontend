"use client"

import { use } from "react"

import { RouteGraphEditor } from "@/components/finance/cost-route/route-graph-editor"

export default function RouteDetailPage({
  params,
}: {
  params: Promise<{ headId: string }>
}) {
  const { headId } = use(params)
  return <RouteGraphEditor headId={Number(headId)} />
}
