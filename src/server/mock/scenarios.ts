import { loadCharter } from "@/server/guardrails/charter";
import type { DemoScenarioId, SpendEvent } from "@/types";
import type { Placement } from "@/types";

let seq = 0;

function eventId(): string {
  seq += 1;
  return `scn_${Date.now()}_${seq}`;
}

export function buildScenarioEvents(
  id: DemoScenarioId,
  placements: Placement[],
): SpendEvent[] {
  const ts = new Date().toISOString();
  const active = placements.filter((p) => p.status === "active");
  const target = active[0];
  if (!target) return [];

  switch (id) {
    case "guardrail_cap": {
      const charter = loadCharter();
      const budget =
        charter.clients[target.clientId]?.daily_budget_gbp ?? 2000;
      return [
        {
          id: eventId(),
          ts,
          placementId: target.id,
          clientId: target.clientId,
          type: "spend_tick",
          spendGbp: budget,
        },
      ];
    }
    case "brand_safety":
      return [
        {
          id: eventId(),
          ts,
          placementId: target.id,
          clientId: target.clientId,
          type: "conversation_context",
          conversationSnippet:
            "User thread about mass layoffs and job loss fears at a major employer.",
        },
      ];
    case "healthy_spike":
      return burstSpend(target, ts, 4, true);
    case "bad_spike":
      return burstSpend(target, ts, 4, false);
    case "zero_conv_burn":
      return [
        {
          id: eventId(),
          ts,
          placementId: target.id,
          clientId: target.clientId,
          type: "spend_tick",
          spendGbp: 340,
          conversions: 0,
        },
      ];
    default:
      return [];
  }
}

function burstSpend(
  target: Placement,
  ts: string,
  multiplier: number,
  withConversions: boolean,
): SpendEvent[] {
  const unit = 22;
  return Array.from({ length: 4 }, (_, i) => ({
    id: eventId(),
    ts: new Date(Date.parse(ts) + i * 1000).toISOString(),
    placementId: target.id,
    clientId: target.clientId,
    type: "spend_tick" as const,
    spendGbp: unit * multiplier,
    conversions: withConversions ? 2 : 0,
  }));
}
