"use client"

// Compact list of attachments with download + delete actions. Reusable at both
// request level (in AttachmentsPanel) and comment level (under each CommentItem).
import { Download, FileIcon, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAttachmentDownloadURL, useDeleteAttachment } from "@/hooks/finance/use-cost-attachment"
import type { CostAttachment } from "@/types/finance/cost-attachment"

interface Props {
  attachments: CostAttachment[]
  canDelete: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentList({ attachments, canDelete }: Props) {
  const downloadM = useAttachmentDownloadURL()
  const deleteM = useDeleteAttachment()

  async function onDownload(a: CostAttachment) {
    try {
      const { url } = await downloadM.mutateAsync({ attachmentId: a.attachmentId })
      window.open(url, "_blank", "noopener,noreferrer")
    } catch {
      /* toast in hook */
    }
  }

  if (attachments.length === 0) {
    return <div className="text-xs text-muted-foreground">No attachments.</div>
  }

  return (
    <ul className="space-y-1 text-sm">
      {attachments.map((a) => (
        <li key={a.attachmentId} className="flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <button
            type="button"
            className="underline text-left truncate flex-1"
            onClick={() => onDownload(a)}
            disabled={downloadM.isPending}
          >
            {a.filename}
          </button>
          <span className="text-xs text-muted-foreground">{formatBytes(a.sizeBytes)}</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onDownload(a)}
            disabled={downloadM.isPending}
            title="Download"
          >
            {downloadM.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          </Button>
          {canDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => {
                if (confirm(`Delete ${a.filename}?`)) {
                  deleteM.mutate({
                    attachmentId: a.attachmentId,
                    requestId: a.requestId,
                    commentId: a.commentId,
                  })
                }
              }}
              disabled={deleteM.isPending}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}
