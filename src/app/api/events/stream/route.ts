import { attachSSE } from "@/server/mock/stream";
import type { StreamMessage } from "@/server/mock/state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Allow longer-lived SSE on Vercel (Pro); Hobby may reconnect more often
export const maxDuration = 60;

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: StreamMessage) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(msg)}\n\n`),
          );
        } catch {
          /* client disconnected */
        }
      };

      attachSSE(send, request.signal);

      request.signal.addEventListener("abort", () => {
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
