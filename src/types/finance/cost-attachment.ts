// Canonical Phase A — CostAttachment (CA_).
export interface CostAttachment {
  attachmentId: number
  requestId?: number
  commentId?: number
  filename: string
  mimeType: string
  sizeBytes: number
  storageKey: string
  uploadedBy: string
  uploadedAt: string
}

const str = (v: unknown) => (typeof v === "string" ? v : "")
const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0))
const numOpt = (v: unknown): number | undefined => {
  if (v === undefined || v === null || v === "" || v === 0 || v === "0") return undefined
  return Number(v)
}

export function normalizeCostAttachment(raw: Record<string, unknown>): CostAttachment {
  return {
    attachmentId: num(raw.attachmentId ?? raw.attachment_id),
    requestId: numOpt(raw.requestId ?? raw.request_id),
    commentId: numOpt(raw.commentId ?? raw.comment_id),
    filename: str(raw.filename),
    mimeType: str(raw.mimeType ?? raw.mime_type),
    sizeBytes: num(raw.sizeBytes ?? raw.size_bytes),
    storageKey: str(raw.storageKey ?? raw.storage_key),
    uploadedBy: str(raw.uploadedBy ?? raw.uploaded_by),
    uploadedAt: str(raw.uploadedAt ?? raw.uploaded_at),
  }
}
