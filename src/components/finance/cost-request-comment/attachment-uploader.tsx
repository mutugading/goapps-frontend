"use client"

// Compact file-picker that uploads to the supplied owner (request or comment).
import { useRef } from "react"
import { Loader2, Paperclip } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useUploadAttachment } from "@/hooks/finance/use-cost-attachment"

interface Props {
  requestId?: number
  commentId?: number
  label?: string
}

const MAX_BYTES = 25 * 1024 * 1024 // FR-5 hard cap

export function AttachmentUploader({ requestId, commentId, label = "Attach file" }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const uploadM = useUploadAttachment()

  function pick() {
    fileInput.current?.click()
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = "" // reset so the same file can be re-picked after errors
    if (!file) return
    if (file.size > MAX_BYTES) {
      alert(`File exceeds 25 MB limit (size = ${(file.size / 1024 / 1024).toFixed(1)} MB).`)
      return
    }
    try {
      await uploadM.mutateAsync({ file, requestId, commentId })
    } catch {
      /* toast in hook */
    }
  }

  return (
    <>
      <input ref={fileInput} type="file" className="hidden" onChange={onChange} />
      <Button type="button" variant="outline" size="sm" onClick={pick} disabled={uploadM.isPending}>
        {uploadM.isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Paperclip className="mr-2 h-3.5 w-3.5" />}
        {label}
      </Button>
    </>
  )
}
