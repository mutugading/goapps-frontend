"use client"

// AttachmentsPanel — request-level attachments. Embedded in the request detail page
// alongside the CommentsPanel.
import { Loader2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAttachmentsByRequest } from "@/hooks/finance/use-cost-attachment"

import { AttachmentList } from "./attachment-list"
import { AttachmentUploader } from "./attachment-uploader"

interface Props {
  requestId: number
  /** When true the request is terminal: hide the uploader + delete actions. */
  readOnly?: boolean
}

export function AttachmentsPanel({ requestId, readOnly = false }: Props) {
  const { data, isLoading } = useAttachmentsByRequest(requestId)
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-0.5">
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
            Attachments
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {readOnly ? "Request is read-only." : "Max 25 MB per file."}
          </div>
        </div>
        {!readOnly && <AttachmentUploader requestId={requestId} label="Upload" />}
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}
        {!isLoading && <AttachmentList attachments={data ?? []} canDelete={!readOnly} />}
      </CardContent>
    </Card>
  )
}
