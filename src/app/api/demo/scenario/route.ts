import { getIngestHub } from "@/server/ingest/hub";
import type { DemoScenarioId } from "@/types";

const VALID: DemoScenarioId[] = [
  "healthy_spike",
  "bad_spike",
  "brand_safety",
  "zero_conv_burn",
  "guardrail_cap",
];

export async function POST(request: Request) {
  const body = (await request.json()) as { scenarioId?: DemoScenarioId };
  const id = body.scenarioId;
  if (!id || !VALID.includes(id)) {
    return Response.json({ error: "Invalid scenarioId" }, { status: 400 });
  }

  getIngestHub().runScenario(id);
  return Response.json({ ok: true, scenarioId: id });
}
