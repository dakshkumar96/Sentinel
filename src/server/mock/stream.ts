import { startBaselineStream, subscribe } from "./state";
import type { StreamMessage } from "./state";

let streamStarted = false;

export function ensureMockStreamRunning() {
  if (!streamStarted) {
    streamStarted = true;
    startBaselineStream();
  }
}

export function attachSSE(
  send: (msg: StreamMessage) => void,
  signal: AbortSignal,
): () => void {
  ensureMockStreamRunning();
  const unsubscribe = subscribe(send);

  signal.addEventListener("abort", () => {
    unsubscribe();
  });

  return unsubscribe;
}
