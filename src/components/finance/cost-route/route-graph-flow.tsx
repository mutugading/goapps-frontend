"use client"

// RouteGraphFlow — read-only(ish) visual DAG using @xyflow/react.
//
// Layout: levels stack TOP-DOWN. Level 1 (FG) at bottom, highest level at top
// — production flows downward, matching the way operators think (RM in, FG
// out at the bottom). Each level is a horizontal row; within a level stages
// are spaced left-to-right by route_seq.
//
// Edges (implicit):
//   • Stage→Stage: an RM with rm_type=PRODUCT pointing to an upstream stage's
//     product creates an edge from the upstream stage (higher level) down to
//     this stage. Label = ratio.
//   • RM→Stage:    ITEM and GROUP RMs render as small RM nodes to the left
//     of their stage, connected by an edge labelled with their ratio.
//
// Editing actions are still driven by the Cards view's dialogs; this view is
// the executive map (used to confirm topology + spot disconnects).

import { useMemo } from "react"
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CostRouteRm, CostRouteSeq, RouteGraph } from "@/types/finance/cost-route"

interface Props {
  graph: RouteGraph
  onAddStage?: () => void
}

// ============================================================================
// Custom node renderers
// ============================================================================

type StageNodeData = {
  level: number
  seq: number
  productCode?: string
  productName?: string
  isFG: boolean
  [key: string]: unknown
}

type RmNodeData = {
  label: string
  kind: "ITEM" | "GROUP"
  [key: string]: unknown
}

const StageNode = ({ data }: NodeProps<Node<StageNodeData>>) => {
  return (
    <div
      className={`rounded-md border bg-card px-3 py-2 shadow-sm ${
        data.isFG ? "border-emerald-400 bg-emerald-50" : "border-blue-300"
      }`}
      style={{ minWidth: 180 }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-mono text-[10px] text-muted-foreground">
        L{data.level} · seq {data.seq}
        {data.isFG ? " · FG" : ""}
      </div>
      <div className="text-sm font-medium">
        {data.productCode || "(no code)"}
      </div>
      {data.productName ? (
        <div className="text-xs text-muted-foreground line-clamp-2">{data.productName}</div>
      ) : null}
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

const RmNode = ({ data }: NodeProps<Node<RmNodeData>>) => {
  return (
    <div
      className={`rounded-md border bg-background px-2 py-1 text-xs shadow-sm ${
        data.kind === "GROUP" ? "border-purple-300 bg-purple-50" : "border-amber-300 bg-amber-50"
      }`}
      style={{ minWidth: 130, maxWidth: 200 }}
    >
      <div className="flex items-center gap-1">
        <Badge variant="outline" className="px-1 py-0 text-[9px]">
          {data.kind}
        </Badge>
        <span className="truncate font-mono">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes = { stage: StageNode, rm: RmNode }

// ============================================================================
// Layout helpers
// ============================================================================

const STAGE_W = 220
const STAGE_H = 90
const STAGE_GAP_X = 80
const LEVEL_GAP_Y = 180

const RM_W = 180
const RM_GAP_X = 30
const RM_GAP_Y = 50

function buildFlow(graph: RouteGraph): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  // Group seqs by level.
  const byLevel = new Map<number, CostRouteSeq[]>()
  for (const s of graph.seqs) {
    const list = byLevel.get(s.routeLevel) ?? []
    list.push(s)
    byLevel.set(s.routeLevel, list)
  }
  const levels = Array.from(byLevel.keys()).sort((a, b) => a - b)
  const maxLevel = levels.length > 0 ? Math.max(...levels) : 1

  // For PRODUCT-RM edges we need to know each product's stage id.
  // Multiple stages may produce the same product (rare); first wins.
  const stageIdByProduct = new Map<number, string>()
  for (const s of graph.seqs) {
    const stageId = `seq-${s.seqId || `${s.routeLevel}-${s.routeSeq}`}`
    if (!stageIdByProduct.has(s.productSysId)) {
      stageIdByProduct.set(s.productSysId, stageId)
    }
  }

  // Layout each level row.
  for (const level of levels) {
    const list = (byLevel.get(level) ?? []).slice().sort((a, b) => a.routeSeq - b.routeSeq)
    // Stages within a level are spaced LEFT-RIGHT by their route_seq.
    list.forEach((s, idx) => {
      const stageId = `seq-${s.seqId || `${s.routeLevel}-${s.routeSeq}`}`
      const x = idx * (STAGE_W + STAGE_GAP_X)
      // Higher levels are HIGHER on screen (i.e. smaller y); level 1 at the bottom.
      const y = (maxLevel - level) * LEVEL_GAP_Y
      nodes.push({
        id: stageId,
        type: "stage",
        position: { x, y },
        data: {
          level: s.routeLevel,
          seq: s.routeSeq,
          productCode: s.productCode,
          productName: s.productName,
          isFG: s.routeLevel === 1,
        } satisfies StageNodeData,
      })

      // RM children: ITEM + GROUP rendered as RM nodes to the LEFT of the stage,
      // stacked vertically. PRODUCT rms become edges (handled below).
      const localRms = (s.rms ?? []).filter((r) => r.rmType !== "PRODUCT")
      localRms.forEach((rm, rmIdx) => {
        const rmId = `rm-${rm.rmId || `${stageId}-${rmIdx}`}`
        nodes.push({
          id: rmId,
          type: "rm",
          position: {
            x: x - (RM_W + RM_GAP_X),
            y: y + rmIdx * RM_GAP_Y,
          },
          data: {
            label: rmLabel(rm),
            kind: rm.rmType === "GROUP" ? "GROUP" : "ITEM",
          } satisfies RmNodeData,
        })
        edges.push({
          id: `e-${rmId}-${stageId}`,
          source: rmId,
          target: stageId,
          label: `×${rm.routeRmRatio}`,
          labelStyle: { fontSize: 10 },
          animated: false,
        })
      })

      // PRODUCT rms become edges from the upstream stage that produces them
      // down to this stage.
      const productRms = (s.rms ?? []).filter((r) => r.rmType === "PRODUCT")
      productRms.forEach((rm) => {
        const upstreamId = rm.rmProductSysId ? stageIdByProduct.get(rm.rmProductSysId) : undefined
        if (!upstreamId) return // dangling — validator should have caught
        edges.push({
          id: `e-${upstreamId}-${stageId}-rm${rm.rmId}`,
          source: upstreamId,
          target: stageId,
          label: `×${rm.routeRmRatio}`,
          labelStyle: { fontSize: 10, fontWeight: 600 },
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 1.5 },
        })
      })
    })
  }

  return { nodes, edges }
}

function rmLabel(rm: CostRouteRm): string {
  if (rm.rmType === "GROUP") return rm.rmGroupCode || rm.routeRmName || "(group)"
  if (rm.rmType === "ITEM") return rm.rmItemCode || rm.routeRmName || "(item)"
  return rm.routeRmName || ""
}

// ============================================================================
// Public component
// ============================================================================

export function RouteGraphFlow({ graph, onAddStage }: Props) {
  const { nodes, edges } = useMemo(() => buildFlow(graph), [graph])

  return (
    <div className="h-[600px] rounded border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        elementsSelectable
        nodesConnectable={false}
      >
        {onAddStage && (
          <Panel position="top-right">
            <Button onClick={onAddStage} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add stage
            </Button>
          </Panel>
        )}
        <Background gap={24} />
        <Controls showInteractive={false} />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  )
}
