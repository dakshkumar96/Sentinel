import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { DemoScenarioId, Investigation, ToolCallRecord, ToolName } from "@/types";
import { TOOL_SETS } from "@/server/agent/investigations";
import { runTool } from "./tools/run";

const MODEL =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

interface ClaudeVerdict {
  verdict: Investigation["verdict"];
  confidence: number;
  requires_human: boolean;
  recommended_action?: Investigation["recommendedAction"];
  reasoning: string;
}

function loadSystemPrompt(): string {
  const path = join(process.cwd(), "src/server/agent/prompts/investigate.md");
  return readFileSync(path, "utf8");
}

function buildToolCalls(
  scenarioId: DemoScenarioId,
  placementId: string,
  clientId: string,
  startedAt: string,
): ToolCallRecord[] {
  const tools = TOOL_SETS[scenarioId] ?? [];
  return tools.map((tool: ToolName, i) => ({
    tool,
    input: { placementId, clientId },
    outputSummary: runTool(tool, { placementId, clientId }, scenarioId),
    ts: new Date(Date.parse(startedAt) + (i + 1) * 1000).toISOString(),
  }));
}

export function hasClaudeApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

export async function runClaudeInvestigation(input: {
  scenarioId: DemoScenarioId;
  alertId: string;
  placementId: string;
  clientId: string;
}): Promise<Investigation> {
  const startedAt = new Date().toISOString();
  const toolCalls = buildToolCalls(
    input.scenarioId,
    input.placementId,
    input.clientId,
    startedAt,
  );

  const evidence = toolCalls
    .map((t) => `• ${t.tool}: ${t.outputSummary}`)
    .join("\n");

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: loadSystemPrompt(),
    messages: [
      {
        role: "user",
        content: `Scenario: ${input.scenarioId}
Placement: ${input.placementId}
Client: ${input.clientId}

Tool evidence:
${evidence}

Respond with ONLY a JSON object (no markdown):
{"verdict":"healthy"|"act"|"escalate","confidence":0.0-1.0,"requires_human":boolean,"recommended_action":"pause"|"scale_down"|"none"|null,"reasoning":"one or two sentences"}`,
      },
    ],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Claude returned no JSON verdict");

  const parsed = JSON.parse(jsonMatch[0]) as ClaudeVerdict;

  return {
    id: `inv_${Date.now()}_claude`,
    alertId: input.alertId,
    startedAt,
    completedAt: new Date().toISOString(),
    signal: `scenario:${input.scenarioId}:claude`,
    toolCalls,
    reasoning: parsed.reasoning,
    verdict: parsed.verdict,
    confidence: Math.min(1, Math.max(0, parsed.confidence)),
    requiresHuman: parsed.requires_human,
    recommendedAction: parsed.recommended_action ?? undefined,
  };
}

// Export tool sets for claude.ts — move TOOL_SETS to shared or export from investigations