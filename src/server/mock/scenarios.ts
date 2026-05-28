import type { DemoScenarioId } from "@/types";
import {
  addAlert,
  emitSpendTick,
  getPlacement,
  setPlacementHealth,
  setPlacementStatus,
  setVelocity,
} from "./state";

const HERO_PLACEMENT = "plc_chatgpt_acme_01";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function burstSpend(
  placementId: string,
  ticks: number,
  amountEach: number,
  conversions: number,
  delayMs: number,
) {
  for (let i = 0; i < ticks; i++) {
    const conv = i < conversions ? 1 : 0;
    emitSpendTick(placementId, amountEach, conv);
    await sleep(delayMs);
  }
}

export async function runScenario(id: DemoScenarioId): Promise<{ ok: true; scenario: DemoScenarioId }> {
  const placement = getPlacement(HERO_PLACEMENT);
  if (!placement) throw new Error("Hero placement not found");

  switch (id) {
    case "healthy_spike": {
      setPlacementHealth(HERO_PLACEMENT, "warning");
      setVelocity(HERO_PLACEMENT, 180);
      await burstSpend(HERO_PLACEMENT, 8, 42, 6, 400);
      setPlacementHealth(HERO_PLACEMENT, "healthy");
      setVelocity(HERO_PLACEMENT, 52);
      addAlert({
        clientId: placement.clientId,
        placementId: HERO_PLACEMENT,
        source: "agent",
        severity: "info",
        title: "Spend spike — healthy",
        summary:
          "Spend rose ~4× in the last hour but conversions tracked proportionally. Logged as scaling — no action needed.",
        status: "resolved",
        requiresHuman: false,
        recommendedAction: "none",
      });
      break;
    }

    case "bad_spike": {
      setPlacementHealth(HERO_PLACEMENT, "critical");
      setVelocity(HERO_PLACEMENT, 220);
      await burstSpend(HERO_PLACEMENT, 10, 48, 0, 350);
      addAlert({
        clientId: placement.clientId,
        placementId: HERO_PLACEMENT,
        source: "agent",
        severity: "critical",
        title: "Spend anomaly — recommend pause",
        summary:
          "ChatGPT placement spend spiked 4× in the last hour with flat conversions. Agent recommends pausing pending review.",
        status: "pending_human",
        requiresHuman: true,
        recommendedAction: "pause",
      });
      break;
    }

    case "brand_safety": {
      addAlert({
        clientId: placement.clientId,
        placementId: HERO_PLACEMENT,
        source: "agent",
        severity: "warning",
        title: "Brand-safety review needed",
        summary:
          'Creative "Summer Sale — celebrate big" served next to conversation: "My team was laid off last week, feeling lost." Possible tone mismatch for Acme Retail.',
        status: "pending_human",
        requiresHuman: true,
        recommendedAction: "none",
      });
      setPlacementHealth(HERO_PLACEMENT, "warning");
      break;
    }

    case "zero_conv_burn": {
      const contoso = "plc_chatgpt_contoso_01";
      setPlacementHealth(contoso, "critical");
      setVelocity(contoso, 95);
      await burstSpend(contoso, 6, 28, 0, 500);
      addAlert({
        clientId: "contoso_fintech",
        placementId: contoso,
        source: "agent",
        severity: "warning",
        title: "Zero conversions — sustained spend",
        summary:
          "£340 spent in the last 48h with 0 conversions on ChatGPT B2B placement. Recommend pause or creative refresh.",
        status: "pending_human",
        requiresHuman: true,
        recommendedAction: "pause",
      });
      break;
    }

    case "guardrail_cap": {
      const north = "plc_chatgpt_north_01";
      setPlacementStatus(north, "paused");
      setPlacementHealth(north, "critical");
      addAlert({
        clientId: "northwind_travel",
        placementId: north,
        source: "guardrail",
        severity: "critical",
        title: "Hard daily cap reached",
        summary:
          "Northwind Travel hit the £8,000 daily budget ceiling. Campaign auto-paused (deterministic guardrail — no agent judgment).",
        status: "open",
        requiresHuman: false,
        recommendedAction: "pause",
      });
      break;
    }

    default:
      throw new Error(`Unknown scenario: ${id}`);
  }

  return { ok: true, scenario: id };
}
