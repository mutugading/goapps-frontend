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
 * create a directed cycle in the PRODUCT-RM dependency graph.
 *
 * Adding edge: downstream consumes upstream as PRODUCT-RM.
 * Cycle forms iff upstream (or any of its transitive upstreams via existing
 * PRODUCT-RM links) can reach downstream — that would close the loop. */
export function wouldCreateCycle(
  graph: RouteGraph,
  upstream: CostRouteSeq,
  downstream: CostRouteSeq,
): boolean {
  // Special case: if upstream IS downstream, that's a self-loop, but
  // isValidProductRmEdge already rejected this before we got here.
  if (upstream.seqId !== 0 && upstream.seqId === downstream.seqId) return true

  // BFS over seq ids (more robust than productSysId-keyed BFS — even though
  // seeds keep products unique per seq, hand-built routes can repeat).
  const visited = new Set<number>()
  const queue: CostRouteSeq[] = [upstream]
  while (queue.length > 0) {
    const current = queue.shift()!
    // We treat seqId === 0 (unsaved) seqs by visiting them at most once via
    // object identity — a Set<CostRouteSeq> would do that, but in practice
    // unsaved nodes have no inbound RMs yet so the BFS terminates quickly.
    if (current.seqId !== 0) {
      if (visited.has(current.seqId)) continue
      visited.add(current.seqId)
    }
    // Did we reach downstream? Then adding the edge would close a cycle.
    if (
      current === downstream ||
      (downstream.seqId !== 0 && current.seqId === downstream.seqId)
    ) {
      return true
    }
    // Walk upstream via PRODUCT-RM links: for each rm, find the seq whose
    // productSysId matches and enqueue it.
    for (const rm of current.rms ?? []) {
      if (rm.rmType !== "PRODUCT" || !rm.rmProductSysId) continue
      const upstreamSeq = graph.seqs.find((s) => s.productSysId === rm.rmProductSysId)
      if (upstreamSeq) queue.push(upstreamSeq)
    }
  }
  return false
}
