// Canonical Phase A — CostRequestComment (CRC_) + edit history (CCEH_) + mentions (CRM_).
export interface CostRequestComment {
  commentId: number
  requestId: number
  parentCommentId?: number
  authorUserId: string
  bodyRichtext: string
  bodyPlaintext: string
  isEdited: boolean
  isHidden: boolean
  hiddenReason?: string
  createdAt?: string
  updatedAt?: string
  mentionedUserIds: string[]
}

export interface CostCommentEditHistory {
  editId: number
  commentId: number
  bodyRichtext: string
  bodyPlaintext: string
  editedBy: string
  editedAt: string
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0))
const numOpt = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "" || v === 0 || v === "0") return undefined
  return Number(v)
}

export function normalizeCostRequestComment(raw: Record<string, unknown>): CostRequestComment {
  const mentions = (raw.mentionedUserIds ?? raw.mentioned_user_ids ?? []) as unknown[]
  return {
    commentId: num(raw.commentId ?? raw.comment_id),
    requestId: num(raw.requestId ?? raw.request_id),
    parentCommentId: numOpt(raw.parentCommentId ?? raw.parent_comment_id),
    authorUserId: str(raw.authorUserId ?? raw.author_user_id),
    bodyRichtext: str(raw.bodyRichtext ?? raw.body_richtext),
    bodyPlaintext: str(raw.bodyPlaintext ?? raw.body_plaintext),
    isEdited: (raw.isEdited ?? raw.is_edited ?? false) as boolean,
    isHidden: (raw.isHidden ?? raw.is_hidden ?? false) as boolean,
    hiddenReason: str(raw.hiddenReason ?? raw.hidden_reason) || undefined,
    createdAt: str(raw.createdAt ?? raw.created_at) || undefined,
    updatedAt: str(raw.updatedAt ?? raw.updated_at) || undefined,
    mentionedUserIds: mentions.map((v) => String(v)),
  }
}

export function normalizeCostCommentEditHistory(raw: Record<string, unknown>): CostCommentEditHistory {
  return {
    editId: num(raw.editId ?? raw.edit_id),
    commentId: num(raw.commentId ?? raw.comment_id),
    bodyRichtext: str(raw.bodyRichtext ?? raw.body_richtext),
    bodyPlaintext: str(raw.bodyPlaintext ?? raw.body_plaintext),
    editedBy: str(raw.editedBy ?? raw.edited_by),
    editedAt: str(raw.editedAt ?? raw.edited_at),
  }
}
