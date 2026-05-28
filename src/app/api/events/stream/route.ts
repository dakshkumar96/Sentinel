import { getIngestHub } from "@/server/ingest/hub";
import type { StreamMessage } from "@/types/stream";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const hub = getIngestHub();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (msg: StreamMessage) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(msg)}\n\n`),
        );
      };

      const unsubscribe = hub.subscribe(send);

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 15_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
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
