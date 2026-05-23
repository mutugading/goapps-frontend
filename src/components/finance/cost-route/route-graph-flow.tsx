"use client"

// RouteGraphFlow — interactive DAG editor using @xyflow/react.
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
// Interactions (gated by `locked`):
//   • Drag a stage node → onNodePositionChange(seqId, x, y)
//   • Connect stage→stage → onConnectStages(sourceSeqId, targetSeqId)
//   • Click stage node → onStageClick(seqId)
//   • Click edge (PRODUCT/ITEM/GROUP RM) → onEdgeClick(rmId)

import { useCallback, useMemo } from "react"
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type NodeProps,
  type EdgeMouseHandler,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CostRouteRm, CostRouteSeq, RouteGraph } from "@/types/finance/cost-route"

interface Props {
  graph: RouteGraph
  locked?: boolean
  onAddStage?: () => void
  /** User finished dragging a stage node to (x,y). */
  onNodePositionChange?: (seqId: number, x: number, y: number) => void
  /** User drew an edge between two stage nodes (source = upstream, target = downstream). */
  onConnectStages?: (sourceSeqId: number, targetSeqId: number) => void
  /** User clicked a stage node. */
  onStageClick?: (seqId: number) => void
  /** User clicked an edge that maps to a CostRouteRm (PRODUCT / ITEM / GROUP). */
  onEdgeClick?: (rmId: number) => void
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
const STAGE_GAP_X = 80
const LEVEL_GAP_Y = 180

const RM_W = 180
const RM_GAP_X = 30
const RM_GAP_Y = 50

// Node ID conventions — must be reversible so we can pluck seqId back out in
// callbacks. Stage nodes use the actual seqId (only when persisted, > 0). For
// new unsaved stages (seqId === 0) we synthesise a stable id from level+seq.
function stageNodeId(seq: CostRouteSeq): string {
  return seq.seqId > 0 ? `seq-${seq.seqId}` : `seq-new-${seq.routeLevel}-${seq.routeSeq}`
}

function rmNodeId(seq: CostRouteSeq, rm: CostRouteRm, rmIdx: number): string {
  return rm.rmId > 0 ? `rm-${rm.rmId}` : `rm-new-${stageNodeId(seq)}-${rmIdx}`
}

// Edge data carries the rmId so onEdgeClick can dispatch back.
type EdgeData = { rmId: number; rmType: "PRODUCT" | "ITEM" | "GROUP" }

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
    if (!stageIdByProduct.has(s.productSysId)) {
      stageIdByProduct.set(s.productSysId, stageNodeId(s))
    }
  }

  // Layout each level row.
  for (const level of levels) {
    const list = (byLevel.get(level) ?? []).slice().sort((a, b) => a.routeSeq - b.routeSeq)
    // Stages within a level are spaced LEFT-RIGHT by their route_seq.
    list.forEach((s, idx) => {
      const id = stageNodeId(s)
      const fallbackX = idx * (STAGE_W + STAGE_GAP_X)
      // Higher levels are HIGHER on screen (i.e. smaller y); level 1 at the bottom.
      const fallbackY = (maxLevel - level) * LEVEL_GAP_Y
      // Use persisted position if non-zero; otherwise fall back to grid layout.
      const hasPersistedPos = (s.positionX !== 0 || s.positionY !== 0)
      const x = hasPersistedPos ? s.positionX : fallbackX
      const y = hasPersistedPos ? s.positionY : fallbackY
      nodes.push({
        id,
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
        const rmId = rmNodeId(s, rm, rmIdx)
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
        // Edge id must be unique even when multiple new (rmId === 0) RMs of the
        // same type exist on the same stage — fall back to rmIdx + ref code.
        const edgeId =
          rm.rmId > 0
            ? `e-${rm.rmType.toLowerCase()}-rm-${rm.rmId}`
            : `e-${rm.rmType.toLowerCase()}-rm-new-${id}-${rm.rmItemCode || rm.rmGroupCode || "x"}-${rmIdx}`
        edges.push({
          id: edgeId,
          source: rmId,
          target: id,
          label: `×${rm.routeRmRatio}`,
          labelStyle: { fontSize: 10 },
          animated: false,
          data: { rmId: rm.rmId, rmType: rm.rmType } satisfies EdgeData,
        })
      })

      // PRODUCT rms become edges from the upstream stage that produces them
      // down to this stage.
      const productRms = (s.rms ?? []).filter((r) => r.rmType === "PRODUCT")
      productRms.forEach((rm, rmIdx) => {
        const upstreamId = rm.rmProductSysId ? stageIdByProduct.get(rm.rmProductSysId) : undefined
        if (!upstreamId) return // dangling — validator should have caught
        // Edge id must be unique even when multiple new (rmId === 0) PRODUCT-RMs
        // exist on the same stage — fall back to upstreamProductSysId + rmIdx.
        const edgeId =
          rm.rmId > 0
            ? `e-product-rm-${rm.rmId}`
            : `e-product-rm-new-${id}-${rm.rmProductSysId}-${rmIdx}`
        edges.push({
          id: edgeId,
          source: upstreamId,
          target: id,
          label: `×${rm.routeRmRatio}`,
          labelStyle: { fontSize: 10, fontWeight: 600 },
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 1.5 },
          data: { rmId: rm.rmId, rmType: "PRODUCT" } satisfies EdgeData,
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

// Pluck the seqId back out of a stage node id. Returns 0 for new/unsaved
// stages — caller must handle the "not yet persisted, ignore" case.
function parseSeqIdFromNodeId(nodeId: string): number {
  // Persisted form: "seq-<id>". New form: "seq-new-<level>-<seq>".
  if (nodeId.startsWith("seq-new-")) return 0
  if (nodeId.startsWith("seq-")) return Number(nodeId.slice(4)) || 0
  return 0
}

// ============================================================================
// Public component
// ============================================================================

export function RouteGraphFlow({
  graph,
  locked = false,
  onAddStage,
  onNodePositionChange,
  onConnectStages,
  onStageClick,
  onEdgeClick,
}: Props) {
  const { nodes, edges } = useMemo(() => buildFlow(graph), [graph])

  const handleNodeDragStop = useCallback<NodeMouseHandler>(
    (_event, node) => {
      if (locked || !onNodePositionChange) return
      if (node.type !== "stage") return
      const seqId = parseSeqIdFromNodeId(node.id)
      if (seqId === 0) {
        // New unsaved stage — find by synthetic id and look up actual seq.
        // We can't safely persist position without seqId; let parent decide
        // via the synthetic key (level/seq embedded in id).
        return
      }
      onNodePositionChange(seqId, node.position.x, node.position.y)
    },
    [locked, onNodePositionChange],
  )

  const handleConnect = useCallback(
    (conn: Connection) => {
      if (locked || !onConnectStages) return
      if (!conn.source || !conn.target) return
      // Only stage↔stage links are meaningful. Reject if either end is an rm-* node.
      if (!conn.source.startsWith("seq-") || !conn.target.startsWith("seq-")) return
      const srcSeqId = parseSeqIdFromNodeId(conn.source)
      const tgtSeqId = parseSeqIdFromNodeId(conn.target)
      if (srcSeqId === 0 || tgtSeqId === 0) return // need persisted stages
      onConnectStages(srcSeqId, tgtSeqId)
    },
    [locked, onConnectStages],
  )

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_event, node) => {
      if (!onStageClick) return
      if (node.type !== "stage") return
      const seqId = parseSeqIdFromNodeId(node.id)
      if (seqId === 0) return
      onStageClick(seqId)
    },
    [onStageClick],
  )

  const handleEdgeClick = useCallback<EdgeMouseHandler>(
    (_event, edge) => {
      if (!onEdgeClick) return
      const data = edge.data as EdgeData | undefined
      if (!data || !data.rmId) return
      onEdgeClick(data.rmId)
    },
    [onEdgeClick],
  )

  return (
    <div className="h-[600px] rounded border bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={!locked}
        elementsSelectable
        nodesConnectable={!locked}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
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
