"use client"

import { useCallback, useRef, useState } from "react"

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useUsers } from "@/hooks/iam/use-users"
import type { NormalizedListResult } from "@/lib/hooks/types"
import type { UserWithDetail } from "@/types/generated/iam/v1/user"

interface MentionableTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
}

interface MentionState {
  active: boolean
  query: string
  startIndex: number
}

// Storage format: @[Display Name](uuid)
// Rendered in display via MentionContent component.
export function MentionableTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled,
}: MentionableTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mention, setMention] = useState<MentionState>({ active: false, query: "", startIndex: -1 })

  // Fetch matching users only when mention is active and query has at least 1 char.
  const usersResult = useUsers(
    mention.active && mention.query.length > 0
      ? { search: mention.query, page: 1, pageSize: 10 }
      : { search: "", page: 1, pageSize: 0 },
  )
  const users = (usersResult.data as NormalizedListResult<UserWithDetail> | undefined)?.data ?? []
  const showPopover = mention.active && mention.query.length > 0 && users.length > 0

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value
      onChange(text)

      const cursor = e.target.selectionStart ?? text.length
      const textBeforeCursor = text.slice(0, cursor)
      const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

      if (mentionMatch) {
        const startIndex = textBeforeCursor.lastIndexOf("@")
        setMention({ active: true, query: mentionMatch[1], startIndex })
      } else {
        setMention({ active: false, query: "", startIndex: -1 })
      }
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (mention.active && e.key === "Escape") {
        setMention({ active: false, query: "", startIndex: -1 })
        e.preventDefault()
      }
    },
    [mention.active],
  )

  const insertMention = useCallback(
    (userId: string, displayName: string) => {
      const before = value.slice(0, mention.startIndex)
      const after = value.slice(mention.startIndex + 1 + mention.query.length)
      const inserted = `@[${displayName}](${userId}) `
      onChange(before + inserted + after)
      setMention({ active: false, query: "", startIndex: -1 })
      textareaRef.current?.focus()
    },
    [value, mention, onChange],
  )

  return (
    <Popover open={showPopover}>
      <PopoverAnchor asChild>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      </PopoverAnchor>
      <PopoverContent
        className="w-64 p-1"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ul className="space-y-0.5">
          {users.map((u) => {
            const uid = u.user?.userId ?? ""
            const username = u.user?.username ?? ""
            const fullName = u.detail?.fullName ?? username
            return (
              <li key={uid}>
                <button
                  type="button"
                  className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    insertMention(uid, fullName || username)
                  }}
                >
                  <span className="font-medium">{fullName || username}</span>
                  <span className="ml-1 text-xs text-muted-foreground">@{username}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

// MentionContent renders @[Name](uuid) tokens as styled spans inside plain text.
export function MentionContent({ text }: { text: string }) {
  const parts = text.split(/(@\[[^\]]+\]\([^)]+\))/)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^@\[([^\]]+)\]\(([^)]+)\)$/)
        if (match) {
          return (
            <span key={i} className="font-medium text-primary">
              @{match[1]}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
