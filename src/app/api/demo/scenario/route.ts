import { runScenario } from "@/server/mock/scenarios";
import type { DemoScenarioId } from "@/types";

export const dynamic = "force-dynamic";

const VALID: DemoScenarioId[] = [
  "healthy_spike",
  "bad_spike",
  "brand_safety",
  "zero_conv_burn",
  "guardrail_cap",
];

export async function POST(request: Request) {
  let body: { scenarioId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const scenarioId = body.scenarioId as DemoScenarioId;
  if (!scenarioId || !VALID.includes(scenarioId)) {
    return Response.json(
      { error: "scenarioId required", valid: VALID },
      { status: 400 },
    );
  }

  const result = await runScenario(scenarioId);
  return Response.json(result);
}
