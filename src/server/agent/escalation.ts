/**
 * Maps agent output + charter.yaml → requiresHuman + auto_act eligibility.
 */
import type { Investigation } from "@/types";

export function resolveEscalation(
  investigation: Pick<Investigation, "confidence" | "verdict" | "recommendedAction">,
  _clientId: string,
): { requiresHuman: boolean; mayAutoAct: boolean } {
  return { requiresHuman: true, mayAutoAct: false };
}
