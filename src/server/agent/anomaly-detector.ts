import { isOutOfBand } from "@/lib/spend/metrics";
import type { DemoScenarioId, SpendEvent } from "@/types";
import type { PlacementLiveState } from "@/types/stream";

export interface AnomalySignal {
  scenarioId: DemoScenarioId;
  title: string;
  exposureGbp: number;
  brandSafetyAmbiguous?: boolean;
}

const BRAND_RISK_PATTERNS = [
  /layoff/i,
  /job loss/i,
  /self[- ]?harm/i,
  /politic/i,
  /violence/i,
  /explicit/i,
];

const COOLDOWN_MS = 45_000;
const ZERO_CONV_TICKS = 4;
const ZERO_CONV_MIN_SPEND = 40;

export interface PlacementSpendTracker {
  zeroConvTicks: number;
  recentSpendGbp: number;
  lastInvestigationAt: number;
}

export function createPlacementTracker(): PlacementSpendTracker {
  return { zeroConvTicks: 0, recentSpendGbp: 0, lastInvestigationAt: 0 };
}

export function updateSpendTracker(
  tracker: PlacementSpendTracker,
  event: SpendEvent,
): void {
  if (event.type !== "spend_tick" || !event.spendGbp) return;
  const conv = event.conversions ?? 0;
  if (conv > 0) {
    tracker.zeroConvTicks = 0;
    tracker.recentSpendGbp = 0;
    return;
  }
  tracker.zeroConvTicks += 1;
  tracker.recentSpendGbp += event.spendGbp;
}

export function detectAnomaly(
  event: SpendEvent,
  state: PlacementLiveState,
  tracker: PlacementSpendTracker,
): AnomalySignal | null {
  const now = Date.now();
  if (now - tracker.lastInvestigationAt < COOLDOWN_MS) return null;

  if (event.type === "conversation_context" && event.conversationSnippet) {
    const risky = BRAND_RISK_PATTERNS.some((p) =>
      p.test(event.conversationSnippet!),
    );
    if (!risky) return null;
    return {
      scenarioId: "brand_safety",
      title: "Brand context review",
      exposureGbp: state.dailySpendGbp,
      brandSafetyAmbiguous: true,
    };
  }

  if (event.type !== "spend_tick" || !event.spendGbp) return null;

  if (
    tracker.zeroConvTicks >= ZERO_CONV_TICKS &&
    tracker.recentSpendGbp >= ZERO_CONV_MIN_SPEND
  ) {
    return {
      scenarioId: "zero_conv_burn",
      title: "Zero-conversion burn detected",
      exposureGbp: tracker.recentSpendGbp,
    };
  }

  if (!isOutOfBand(state.hourlyBuckets)) return null;

  const hasConversions = (event.conversions ?? 0) > 0;
  const peak = Math.max(...state.hourlyBuckets, 0);

  if (hasConversions) {
    return {
      scenarioId: "healthy_spike",
      title: "Spend spike — AI monitoring",
      exposureGbp: peak,
    };
  }

  return {
    scenarioId: "bad_spike",
    title: "Spend spike — conversion flat",
    exposureGbp: peak,
  };
}

export function markInvestigationRan(tracker: PlacementSpendTracker): void {
  tracker.lastInvestigationAt = Date.now();
  tracker.zeroConvTicks = 0;
  tracker.recentSpendGbp = 0;
}
