"use client"

import { useState, useEffect, useRef, useCallback } from "react"

/**
 * Hook that debounces a value
 * Returns the debounced value that only updates after the specified delay
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState("")
 * const debouncedSearch = useDebounce(search, 300)
 *
 * // debouncedSearch only updates 300ms after user stops typing
 * useEffect(() => {
 *   fetchResults(debouncedSearch)
 * }, [debouncedSearch])
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook that returns a debounced callback function
 * The callback will only execute after the specified delay since the last call
 *
 * @param callback - The function to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns A debounced version of the callback
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback((value: string) => {
 *   onSearch(value)
 * }, 300)
 *
 * <Input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  )
}

/**
 * Hook for managing a local input state that syncs to external state with debounce
 * Perfect for search inputs where you want immediate UI feedback but debounced API calls
 *
 * Uses key-based reset pattern via returned resetKey to handle external state sync.
 *
 * @param externalValue - The current value from external state (e.g., URL state)
 * @param onExternalChange - Callback to update external state
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns Object containing localValue, setLocalValue, and resetKey for component remounting
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useUrlState({ defaultValues: { search: "" } })
 *
 * const { localValue, setLocalValue, resetKey } = useDebouncedState(
 *   filters.search,
 *   (value) => setFilters({ ...filters, search: value, page: 1 }),
 *   300
 * )
 *
 * // Use resetKey as component key to handle external value changes
 * <Input
 *   key={resetKey}
 *   defaultValue={localValue}
 *   onChange={(e) => setLocalValue(e.target.value)}
 * />
 * ```
 */
export function useDebouncedState<T>(
  externalValue: T,
  onExternalChange: (value: T) => void,
  delay: number = 300
): {
  localValue: T
  setLocalValue: (value: T) => void
  resetKey: number
} {
  const [localValue, setLocalValue] = useState<T>(externalValue)
  const [resetKey, setResetKey] = useState(0)
  const lastEmittedValue = useRef<T>(externalValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect external changes and trigger reset
  // This is an intentional sync pattern - we need to sync when external value changes
  useEffect(() => {
    if (externalValue !== lastEmittedValue.current) {
      lastEmittedValue.current = externalValue
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync external state
      setLocalValue(externalValue)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: trigger reset
      setResetKey((k) => k + 1)
    }
  }, [externalValue])

  // Debounced external sync when local value changes
  useEffect(() => {
    // Skip if this is our own emission or values are the same
    if (localValue === lastEmittedValue.current) {
      return
    }

    timerRef.current = setTimeout(() => {
      lastEmittedValue.current = localValue
      onExternalChange(localValue)
    }, delay)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [localValue, delay, onExternalChange])

  return { localValue, setLocalValue, resetKey }
}
