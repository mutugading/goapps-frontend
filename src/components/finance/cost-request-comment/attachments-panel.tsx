"use client"

import { Loader2, Paperclip } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAttachmentsByRequest } from "@/hooks/finance/use-cost-attachment"

import { AttachmentList } from "./attachment-list"
import { AttachmentUploader } from "./attachment-uploader"

interface Props {
  requestId: number
  /** When true the request is terminal: hide the uploader + delete actions. */
  readOnly?: boolean
  /**
   * When true, renders without a Card wrapper — use this to embed the attachment
   * section inside an existing card (e.g. the main header card).
   */
  inline?: boolean
}

function AttachmentsContent({ requestId, readOnly }: { requestId: number; readOnly: boolean }) {
  const { data, isLoading } = useAttachmentsByRequest(requestId)
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Attachments{data && data.length > 0 && ` (${data.length})`}
          </span>
        </div>
        {!readOnly && <AttachmentUploader requestId={requestId} label="Upload" />}
      </div>
      {isLoading && (
        <div className="text-xs text-muted-foreground flex items-center gap-2 pt-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      )}
      {!isLoading && <AttachmentList attachments={data ?? []} canDelete={!readOnly} />}
    </>
  )
}

export function AttachmentsPanel({ requestId, readOnly = false, inline = false }: Props) {
  if (inline) {
    return <AttachmentsContent requestId={requestId} readOnly={readOnly} />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-semibold">Attachments</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            {readOnly ? "Request is read-only." : "Max 25 MB per file."}
          </p>
        </div>
        {!readOnly && <AttachmentUploader requestId={requestId} label="Upload" />}
      </CardHeader>
      <CardContent>
        <AttachmentsContent requestId={requestId} readOnly={readOnly} />
      </CardContent>
    </Card>
  )
}
