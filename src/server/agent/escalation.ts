import { loadCharter } from "@/server/guardrails/charter";
import type { Investigation } from "@/types";

export interface EscalationMeta {
  exposureGbp?: number;
  brandSafetyAmbiguous?: boolean;
}

export interface EscalationResult {
  requiresHuman: boolean;
  mayAutoAct: boolean;
  reason?: string;
}

/**
 * Scenario-hardcoded requiresHuman is the demo source of truth;
 * charter rules can only tighten (never skip human on enterprise / low confidence).
 */
export function resolveEscalation(
  investigation: Pick<
    Investigation,
    "confidence" | "verdict" | "recommendedAction" | "requiresHuman"
  >,
  clientId: string,
  meta: EscalationMeta = {},
): EscalationResult {
  const charter = loadCharter();
  const client = charter.clients[clientId];
  const exposure = meta.exposureGbp ?? 0;

  if (investigation.verdict === "healthy") {
    return {
      requiresHuman: false,
      mayAutoAct: false,
      reason: "Healthy verdict — logged without human gate.",
    };
  }

  let requiresHuman = investigation.requiresHuman;
  const reasons: string[] = [];

  if (investigation.confidence < 0.75) {
    requiresHuman = true;
    reasons.push("confidence below 0.75");
  }
  if (client?.tier === "enterprise") {
    requiresHuman = true;
    reasons.push("enterprise client tier");
  }
  if (exposure > 500) {
    requiresHuman = true;
    reasons.push("exposure above £500");
  }
  if (meta.brandSafetyAmbiguous) {
    requiresHuman = true;
    reasons.push("ambiguous brand-safety");
  }

  const mayAutoAct =
    !requiresHuman &&
    investigation.confidence >= 0.9 &&
    client?.tier === "standard" &&
    investigation.recommendedAction === "pause" &&
    exposure < 200;

  return {
    requiresHuman,
    mayAutoAct,
    reason: reasons.length ? reasons.join(", ") : undefined,
  };
}
