// DAG validation rules for the React Flow cost-route editor.
//
// Level convention (matches the editor + RouteGraphFlow):
//   level 1 = Finished Good (bottom of canvas)
//   level N (high) = Raw Material (top of canvas)
//   production flows from HIGH level → LOW level
//
// PRODUCT-RM edges therefore go FROM upstream (higher level) → downstream
// (lower level). Same-level and reverse-flow edges are forbidden, as are
// cycles.

import type { CostRouteSeq, RouteGraph } from "@/types/finance/cost-route"

export type EdgeValidation =
  | { ok: true }
  | { ok: false; reason: string }

/** isValidProductRmEdge — gating rules for a new PRODUCT-type RM edge from
 * `upstream` (the producing stage) to `downstream` (the consuming stage). */
export function isValidProductRmEdge(
  graph: RouteGraph,
  upstream: CostRouteSeq,
  downstream: CostRouteSeq,
): EdgeValidation {
  if (upstream === downstream || (upstream.seqId !== 0 && upstream.seqId === downstream.seqId)) {
    return { ok: false, reason: "Cannot connect a stage to itself." }
  }
  if (upstream.routeLevel === downstream.routeLevel) {
    return { ok: false, reason: "Cannot connect two stages at the same level." }
  }
  if (upstream.routeLevel < downstream.routeLevel) {
    return {
      ok: false,
      reason: "Invalid connection — upstream must be at a higher level than downstream.",
    }
  }
  // Cycle check: walking the existing PRODUCT-RM graph upstream from
  // `upstream` must NEVER reach `downstream`. (We are about to add an edge
  // downstream→upstream in graph-terms, which would close a cycle.)
  if (wouldCreateCycle(graph, upstream, downstream)) {
    return { ok: false, reason: "This connection would create a cycle." }
  }
  // Duplicate PRODUCT-RM guard (same upstream product already feeds downstream).
  const dup = (downstream.rms ?? []).some(
    (r) => r.rmType === "PRODUCT" && r.rmProductSysId === upstream.productSysId,
  )
  if (dup) {
    return { ok: false, reason: "This upstream product is already an input to that stage." }
  }
  return { ok: true }
}

/** wouldCreateCycle — true iff adding an edge upstream→downstream would
 * create a directed cycle in the PRODUCT-RM dependency graph. */
export function wouldCreateCycle(
  graph: RouteGraph,
  upstream: CostRouteSeq,
  downstream: CostRouteSeq,
): boolean {
  // Build product→consumers index: for each seq, the upstream seqs it depends
  // on (i.e. seqs whose product is a PRODUCT-RM of this seq).
  const seqByProduct = new Map<number, CostRouteSeq>()
  for (const s of graph.seqs) {
    if (!seqByProduct.has(s.productSysId)) seqByProduct.set(s.productSysId, s)
  }

  // BFS upstream from `upstream`. If we ever land on `downstream`, the new
  // edge (which adds downstream→upstream in dependency terms — downstream
  // depends on upstream) would close a cycle.
  const visited = new Set<number>()
  const queue: CostRouteSeq[] = [upstream]
  while (queue.length > 0) {
    const cur = queue.shift()!
    const key = cur.productSysId
    if (visited.has(key)) continue
    visited.add(key)
    if (cur.productSysId === downstream.productSysId) return true
    for (const rm of cur.rms ?? []) {
      if (rm.rmType !== "PRODUCT" || !rm.rmProductSysId) continue
      const parent = seqByProduct.get(rm.rmProductSysId)
      if (parent) queue.push(parent)
    }
  }
  return false
}
