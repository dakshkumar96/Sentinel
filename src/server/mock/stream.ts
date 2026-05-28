/**
 * Mock event emitter — interval + scenario hooks for SSE.
 */
import type { SpendEvent } from "@/types";

export function createMockStream(_onEvent: (e: SpendEvent) => void) {
  return { start: () => {}, stop: () => {} };
}
