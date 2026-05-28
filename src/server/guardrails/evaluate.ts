/**
 * Deterministic guardrail evaluation on each SpendEvent.
 * Reads config/charter.yaml — never calls LLM.
 */
import type { Alert, SpendEvent } from "@/types";

export function evaluateGuardrails(_event: SpendEvent): Alert | null {
  return null;
}
