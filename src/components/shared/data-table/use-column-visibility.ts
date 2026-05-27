"use client"

import { useCallback, useMemo, useSyncExternalStore } from "react"

import type { ColumnDef } from "./types"

const STORAGE_PREFIX = "datatable:cols:"

function storageKey(tableId: string): string {
  return STORAGE_PREFIX + tableId
}

function readStored(key: string): Record<string, boolean> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, boolean>
    }
  } catch {
    // ignore corrupt entries
  }
  return null
}

function writeStored(key: string, state: Record<string, boolean>): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(state))
    // Notify other consumers in the same tab.
    window.dispatchEvent(new StorageEvent("storage", { key }))
  } catch {
    // localStorage full / disabled — silent fail
  }
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("storage", callback)
  return () => window.removeEventListener("storage", callback)
}

/**
 * useColumnVisibility persists which columns are hidden per-table in localStorage.
 *
 * Returns a stable map (column id → visible) and toggle helpers. Reads via
 * useSyncExternalStore so SSR renders the seed (defaultHidden) values and the
 * client takes over after hydration without an effect-driven re-render.
 */
export function useColumnVisibility<TData>(
  tableId: string | undefined,
  columns: ColumnDef<TData>[],
): {
  visibility: Record<string, boolean>
  toggle: (columnId: string) => void
  setAll: (visible: boolean) => void
  reset: () => void
} {
  const seed = useMemo<Record<string, boolean>>(() => {
    const out: Record<string, boolean> = {}
    for (const col of columns) {
      out[col.id] = !col.defaultHidden
    }
    return out
  }, [columns])

  const key = tableId ? storageKey(tableId) : ""

  // useSyncExternalStore: getSnapshot reads from localStorage on the client and
  // returns a stable string for cache invalidation; we then merge it with seed.
  const snapshot = useSyncExternalStore(
    subscribe,
    () => (key ? window.localStorage.getItem(key) : null),
    () => null,
  )

  const visibility = useMemo<Record<string, boolean>>(() => {
    if (!key || !snapshot) return seed
    const stored = readStored(key)
    if (!stored) return seed
    const merged = { ...seed }
    for (const col of columns) {
      if (Object.hasOwn(stored, col.id) && typeof stored[col.id] === "boolean") {
        merged[col.id] = stored[col.id]
      }
    }
    return merged
  }, [seed, snapshot, key, columns])

  const persist = useCallback(
    (next: Record<string, boolean>) => {
      if (key) writeStored(key, next)
    },
    [key],
  )

  const toggle = useCallback(
    (columnId: string) => {
      const next = { ...visibility, [columnId]: !visibility[columnId] }
      persist(next)
    },
    [visibility, persist],
  )

  const setAll = useCallback(
    (visible: boolean) => {
      const next: Record<string, boolean> = {}
      for (const col of columns) {
        next[col.id] = col.canHide === false ? true : visible
      }
      persist(next)
    },
    [columns, persist],
  )

  const reset = useCallback(() => {
    persist(seed)
  }, [seed, persist])

  return { visibility, toggle, setAll, reset }
}
