import type { Alert, SpendEvent } from "@/types";
import { loadCharter, matchBlocklistedTopic } from "./charter";
import type { SpendAccumulator } from "./accumulator";

export interface GuardrailContext {
  accumulator: SpendAccumulator;
  pausedPlacementIds: Set<string>;
}

export interface GuardrailResult {
  alert: Alert | null;
  pausePlacementIds: string[];
}

let alertSeq = 0;

function nextAlertId(): string {
  alertSeq += 1;
  return `grd_${Date.now()}_${alertSeq}`;
}

export function evaluateGuardrails(
  event: SpendEvent,
  ctx: GuardrailContext,
): GuardrailResult {
  const charter = loadCharter();
  const pausePlacementIds: string[] = [];

  if (event.type === "conversation_context" && event.conversationSnippet) {
    const topic = matchBlocklistedTopic(event.conversationSnippet);
    if (topic) {
      return {
        alert: buildAlert(event, {
          title: "Blocklisted conversation context",
          summary: `Detected “${topic.replace(/_/g, " ")}” near placement. Auto-paused per charter.`,
          severity: "critical",
          recommendedAction: "pause",
        }),
        pausePlacementIds: event.placementId ? [event.placementId] : [],
      };
    }
  }

  if (event.type !== "spend_tick" || !(event.spendGbp && event.spendGbp > 0)) {
    return { alert: null, pausePlacementIds: [] };
  }

  const { clientTotal, globalTotal } = ctx.accumulator.ingest(event);
  const clientCfg = charter.clients[event.clientId];

  if (globalTotal >= charter.guardrails.absolute_daily_cap_gbp) {
    return {
      alert: buildAlert(event, {
        title: "Global daily cap reached",
        summary: `£${globalTotal.toFixed(0)} across all clients (limit £${charter.guardrails.absolute_daily_cap_gbp}).`,
        severity: "critical",
        recommendedAction: "pause",
      }),
      pausePlacementIds: [], // hub pauses all active
    };
  }

  if (clientCfg && clientTotal >= clientCfg.daily_budget_gbp) {
    return {
      alert: buildAlert(event, {
        title: "Client budget cap reached",
        summary: `£${clientTotal.toFixed(0)} for ${event.clientId} (limit £${clientCfg.daily_budget_gbp}).`,
        severity: "critical",
        recommendedAction: "pause",
      }),
      pausePlacementIds: [], // hub pauses all for client
    };
  }

  return { alert: null, pausePlacementIds };
}

function buildAlert(
  event: SpendEvent,
  fields: Pick<Alert, "title" | "summary" | "severity" | "recommendedAction">,
): Alert {
  return {
    id: nextAlertId(),
    ts: event.ts,
    clientId: event.clientId,
    placementId: event.placementId,
    source: "guardrail",
    severity: fields.severity,
    title: fields.title,
    summary: fields.summary,
    status: "open",
    recommendedAction: fields.recommendedAction,
    requiresHuman: false,
  };
}
