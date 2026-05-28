import {
  applyScenarioPolicy,
  buildScenarioInvestigation,
} from "./investigations";
import { hasClaudeApiKey, runClaudeInvestigation } from "./claude";
import { resolveEscalation } from "./escalation";
import type { DemoScenarioId, Investigation } from "@/types";

export interface RunInvestigationInput {
  scenarioId: DemoScenarioId;
  alertId: string;
  placementId: string;
  clientId: string;
  exposureGbp?: number;
  brandSafetyAmbiguous?: boolean;
}

export async function runInvestigation(
  input: RunInvestigationInput,
): Promise<Investigation> {
  let investigation: Investigation;

  if (hasClaudeApiKey()) {
    try {
      investigation = await runClaudeInvestigation(input);
    } catch {
      investigation = buildScenarioInvestigation(input);
    }
  } else {
    investigation = buildScenarioInvestigation(input);
  }

  investigation = applyScenarioPolicy(investigation, input.scenarioId);

  const { requiresHuman } = resolveEscalation(investigation, input.clientId, {
    exposureGbp: input.exposureGbp,
    brandSafetyAmbiguous: input.brandSafetyAmbiguous,
  });

  return { ...investigation, requiresHuman };
}
