// SSE bridge — proxies the IAM gRPC StreamNotifications server-streaming RPC
// to the browser as Server-Sent Events.
//
// Reconnect resumes via the standard `Last-Event-ID` HTTP header, which the
// EventSource API sends automatically. We forward it as `since` to the
// upstream gRPC stream which replays missed notifications from the DB.

import { NextRequest } from "next/server"
import { createMetadataFromRequest } from "@/lib/grpc"
import { getNotificationStreamingClient } from "@/lib/grpc/notification-stream-client"
import type { StreamNotificationsResponse } from "@/types/generated/iam/v1/notification"

export const runtime = "nodejs"
// Streaming responses must NOT be cached; also disable Next's static optimization.
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const since = request.headers.get("Last-Event-ID") ?? ""
  const metadata = createMetadataFromRequest(request)
  const client = getNotificationStreamingClient()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder()
      const call = client.streamNotifications({ since }, metadata)

      const closeSafe = () => {
        try {
          call.cancel()
        } catch {
          // already cancelled
        }
        try {
          controller.close()
        } catch {
          // already closed
        }
      }

      call.on("data", (event: StreamNotificationsResponse) => {
        // Encode as SSE frame.
        // Heartbeat events have notification=null — we still send them so the
        // browser keeps the connection warm and tracks Last-Event-ID.
        const eventId = event.eventId ?? ""
        const payload = JSON.stringify(event)
        const frame = `id: ${eventId}\nevent: notification\ndata: ${payload}\n\n`
        try {
          controller.enqueue(encoder.encode(frame))
        } catch {
          // controller closed by client disconnect
          closeSafe()
        }
      })

      call.on("end", () => {
        closeSafe()
      })

      call.on("error", (err) => {
        // Forward as SSE error frame, then close. EventSource will reconnect.
        const frame = `event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`
        try {
          controller.enqueue(encoder.encode(frame))
        } catch {
          // ignore
        }
        closeSafe()
      })

      // Tear down upstream gRPC call when the browser disconnects.
      request.signal.addEventListener("abort", closeSafe)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable NGINX buffering for streaming.
    },
  })
}
