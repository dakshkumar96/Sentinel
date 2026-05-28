import type { DemoScenarioId, Investigation, ToolCallRecord, ToolName } from "@/types";
import { runTool } from "./tools/run";

interface ScenarioInvestigationInput {
  scenarioId: DemoScenarioId;
  alertId: string;
  placementId: string;
  clientId: string;
}

const TOOL_SETS: Record<DemoScenarioId, ToolName[]> = {
  healthy_spike: [
    "get_conversion_trend",
    "get_client_context",
    "get_historical_baseline",
  ],
  bad_spike: [
    "get_conversion_trend",
    "get_client_context",
    "get_historical_baseline",
  ],
  brand_safety: [
    "get_conversation_context",
    "get_brand_guidelines",
    "get_client_context",
  ],
  zero_conv_burn: [
    "get_conversion_trend",
    "get_historical_baseline",
    "get_client_context",
  ],
  guardrail_cap: [],
};

const SCENARIO_META: Record<
  Exclude<DemoScenarioId, "guardrail_cap">,
  Pick<
    Investigation,
    "verdict" | "confidence" | "requiresHuman" | "recommendedAction" | "reasoning"
  >
> = {
  healthy_spike: {
    verdict: "healthy",
    confidence: 0.92,
    requiresHuman: false,
    recommendedAction: "none",
    reasoning:
      "Spend spike matches conversion lift and an active promo window — scaling is healthy.",
  },
  bad_spike: {
    verdict: "act",
    confidence: 0.88,
    requiresHuman: true,
    recommendedAction: "pause",
    reasoning:
      "4× spend with flat conversions and no launch on calendar — recommend pause pending review.",
  },
  brand_safety: {
    verdict: "escalate",
    confidence: 0.71,
    requiresHuman: true,
    recommendedAction: "pause",
    reasoning:
      "Upbeat retail creative adjacent to layoffs conversation — brand tone mismatch; human review required.",
  },
  zero_conv_burn: {
    verdict: "act",
    confidence: 0.91,
    requiresHuman: true,
    recommendedAction: "pause",
    reasoning:
      "£340 spent in 6h with zero conversions — burn pattern; recommend pause.",
  },
};

let invSeq = 0;

export function buildScenarioInvestigation(
  input: ScenarioInvestigationInput,
): Investigation {
  const { scenarioId, alertId, placementId, clientId } = input;
  const startedAt = new Date().toISOString();
  const tools = TOOL_SETS[scenarioId] ?? [];

  const toolCalls: ToolCallRecord[] = tools.map((tool, i) => ({
    tool,
    input: { placementId, clientId },
    outputSummary: runTool(tool, { placementId, clientId }, scenarioId),
    ts: new Date(Date.parse(startedAt) + (i + 1) * 1000).toISOString(),
  }));

  invSeq += 1;
  const meta =
    scenarioId === "guardrail_cap"
      ? null
      : SCENARIO_META[scenarioId as Exclude<DemoScenarioId, "guardrail_cap">];

  return {
    id: `inv_${Date.now()}_${invSeq}`,
    alertId,
    startedAt,
    completedAt: new Date().toISOString(),
    signal: `scenario:${scenarioId}`,
    toolCalls,
    reasoning: meta?.reasoning ?? "",
    verdict: meta?.verdict ?? "healthy",
    confidence: meta?.confidence ?? 1,
    requiresHuman: meta?.requiresHuman ?? false,
    recommendedAction: meta?.recommendedAction,
  };
}

export const AGENT_SCENARIOS: DemoScenarioId[] = [
  "healthy_spike",
  "bad_spike",
  "brand_safety",
  "zero_conv_burn",
];
