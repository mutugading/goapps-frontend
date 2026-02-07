"use client"

import { useState, useEffect, useRef, useCallback, type InputHTMLAttributes } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DebouncedSearchInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  /** Current search value from external state (e.g., URL state) */
  value: string
  /** Callback when search value changes (debounced) */
  onValueChange: (value: string) => void
  /** Debounce delay in milliseconds (default: 300ms) */
  debounceMs?: number
  /** Show search icon (default: true) */
  showIcon?: boolean
  /** Show clear button when there's text (default: true) */
  showClear?: boolean
  /** Additional class names for the container */
  containerClassName?: string
}

/**
 * Internal controlled input with debounce logic
 * Separated to allow key-based remounting for external sync
 */
function DebouncedInput({
  initialValue,
  onDebouncedChange,
  debounceMs,
  showIcon,
  showClear,
  placeholder,
  className,
  disabled,
  inputRef,
  ...props
}: {
  initialValue: string
  onDebouncedChange: (value: string) => void
  debounceMs: number
  showIcon: boolean
  showClear: boolean
  placeholder: string
  className?: string
  disabled?: boolean
  inputRef: React.RefObject<HTMLInputElement | null>
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [localValue, setLocalValue] = useState(initialValue)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Handle input change - update local immediately, debounce external
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)

      // Clear any pending timer
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      // Set new debounced update
      timerRef.current = setTimeout(() => {
        onDebouncedChange(newValue)
      }, debounceMs)
    },
    [debounceMs, onDebouncedChange]
  )

  // Handle clear button click - immediate (no debounce needed for clear)
  const handleClear = useCallback(() => {
    // Clear any pending timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    setLocalValue("")
    onDebouncedChange("")
    inputRef.current?.focus()
  }, [onDebouncedChange, inputRef])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return (
    <>
      {showIcon && (
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      )}
      <Input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          showIcon && "pl-9",
          showClear && localValue && "pr-9",
          className
        )}
        {...props}
      />
      {showClear && localValue && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
        >
          <X className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </>
  )
}

/**
 * A search input component with built-in debouncing
 *
 * Features:
 * - Immediate UI feedback (local state)
 * - Debounced sync to external state (prevents excessive API calls)
 * - Auto-sync from external state (handles browser back/forward)
 * - Clear button for quick reset
 * - Search icon for visual clarity
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useUrlState({ defaultValues: { search: "" } })
 *
 * <DebouncedSearchInput
 *   value={filters.search}
 *   onValueChange={(search) => setFilters({ ...filters, search, page: 1 })}
 *   placeholder="Search..."
 *   debounceMs={300}
 * />
 * ```
 */
export function DebouncedSearchInput({
  value,
  onValueChange,
  debounceMs = 300,
  showIcon = true,
  showClear = true,
  placeholder = "Search...",
  className,
  containerClassName,
  disabled,
  ...props
}: DebouncedSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Use key to remount the inner component when external value changes
  // This resets the local state to match external state
  // Only remount when value changes from external source (not from our own updates)
  const [syncKey, setSyncKey] = useState(0)
  const lastEmittedValue = useRef(value)

  // Detect external changes (browser back/forward, clear filters, etc.)
  // This is an intentional sync pattern - we need to remount when external value changes
  useEffect(() => {
    if (value !== lastEmittedValue.current) {
      lastEmittedValue.current = value
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: remount on external change
      setSyncKey((k) => k + 1)
    }
  }, [value])

  // Wrapper to track our own emissions
  const handleDebouncedChange = useCallback(
    (newValue: string) => {
      lastEmittedValue.current = newValue
      onValueChange(newValue)
    },
    [onValueChange]
  )

  return (
    <div className={cn("relative", containerClassName)}>
      <DebouncedInput
        key={syncKey}
        initialValue={value}
        onDebouncedChange={handleDebouncedChange}
        debounceMs={debounceMs}
        showIcon={showIcon}
        showClear={showClear}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        inputRef={inputRef}
        {...props}
      />
    </div>
  )
}
