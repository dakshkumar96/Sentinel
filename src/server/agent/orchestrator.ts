/**
 * Agent loop: pick tools → gather evidence → verdict + escalation meta-decision.
 * Uses Anthropic API with structured output; enforces charter soft policy.
 */
import type { Investigation } from "@/types";

export async function runInvestigation(_input: {
  alertId: string;
  signal: string;
}): Promise<Investigation> {
  throw new Error("Not implemented — Phase 3");
}
