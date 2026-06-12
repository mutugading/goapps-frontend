"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useUsers } from "@/hooks/iam/use-users"
import type { NormalizedListResult } from "@/lib/hooks/types"
import type { UserWithDetail } from "@/types/generated/iam/v1/user"

interface MentionableTextareaProps {
  value: string
  onChange: (value: string) => void
  /** Called whenever the set of mentioned user IDs changes. */
  onMentionsChange?: (mentionedUserIds: string[]) => void
  placeholder?: string
  rows?: number
  disabled?: boolean
}

interface MentionState {
  active: boolean
  query: string
  startIndex: number
}

export function MentionableTextarea({
  value,
  onChange,
  onMentionsChange,
  placeholder,
  rows = 3,
  disabled,
}: MentionableTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [mention, setMention] = useState<MentionState>({ active: false, query: "", startIndex: -1 })
  // mentionMap: displayName → uuid — tracks which names map to which UUIDs
  const [mentionMap, setMentionMap] = useState<Map<string, string>>(new Map())

  // Fetch matching users only when mention is active and query has at least 1 char.
  const usersResult = useUsers(
    mention.active && mention.query.length > 0
      ? { search: mention.query, page: 1, pageSize: 10 }
      : { search: "", page: 1, pageSize: 0 },
  )
  const users = (usersResult.data as NormalizedListResult<UserWithDetail> | undefined)?.data ?? []
  const showPopover = mention.active && mention.query.length > 0 && users.length > 0

  // Propagate UUID list to parent whenever value or mentionMap changes.
  useEffect(() => {
    if (!onMentionsChange) return
    const uuids: string[] = []
    const seen = new Set<string>()
    for (const [name, uuid] of mentionMap.entries()) {
      if (value.includes(`@${name}`) && !seen.has(uuid)) {
        seen.add(uuid)
        uuids.push(uuid)
      }
    }
    onMentionsChange(uuids)
  }, [value, mentionMap, onMentionsChange])

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
      // Insert @DisplayName (readable) — UUIDs tracked separately in mentionMap.
      const displayToken = `@${displayName} `
      onChange(before + displayToken + after)
      setMentionMap((prev) => {
        const next = new Map(prev)
        next.set(displayName, userId)
        return next
      })
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

// MentionContent renders both storage formats:
// - Legacy: @[Name](uuid) — already stored in DB
// - New: @Name — posted after this change (plain @mention)
export function MentionContent({ text }: { text: string }) {
  const parts = text.split(/(@\[[^\]]+\]\([^)]+\)|@\w[\w\s]*)/)
  return (
    <>
      {parts.map((part, i) => {
        // Legacy format: @[Name](uuid)
        const oldMatch = part.match(/^@\[([^\]]+)\]\(([^)]+)\)$/)
        if (oldMatch) {
          return (
            <span key={i} className="font-medium text-primary">
              @{oldMatch[1]}
            </span>
          )
        }
        // New format: @Word or @Multi Word — treat as mention display
        if (part.match(/^@\w/)) {
          return (
            <span key={i} className="font-medium text-primary">
              {part}
            </span>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
