import { buildScenarioInvestigation } from "./investigations";
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

export function runInvestigation(input: RunInvestigationInput): Investigation {
  const investigation = buildScenarioInvestigation(input);
  const { requiresHuman } = resolveEscalation(
    investigation,
    input.clientId,
    {
      exposureGbp: input.exposureGbp,
      brandSafetyAmbiguous: input.brandSafetyAmbiguous,
    },
  );
  return { ...investigation, requiresHuman };
}
