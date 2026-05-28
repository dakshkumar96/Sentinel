import type { Placement, SpendEvent } from "@/types";
import placementsFixture from "./fixtures/placements.json";

const TICK_MS = 2_500;
const BASE_SPEND_MIN = 3;
const BASE_SPEND_MAX = 18;

let eventSeq = 0;

function nextEventId(): string {
  eventSeq += 1;
  return `evt_${Date.now()}_${eventSeq}`;
}

function randomSpend(): number {
  return (
    Math.round(
      (BASE_SPEND_MIN + Math.random() * (BASE_SPEND_MAX - BASE_SPEND_MIN)) * 100,
    ) / 100
  );
}

function pickActive(placements: Placement[]): Placement | null {
  const active = placements.filter((p) => p.status === "active");
  if (active.length === 0) return null;
  return active[Math.floor(Math.random() * active.length)]!;
}

export function createMockStream(
  getPlacements: () => Placement[],
  onEvent: (e: SpendEvent) => void,
) {
  let timer: ReturnType<typeof setInterval> | null = null;
  let tick = 0;

  const emitTick = () => {
    const placement = pickActive(getPlacements());
    if (!placement) return;

    tick += 1;
    const ts = new Date().toISOString();

    if (tick % 20 === 0) {
      onEvent({
        id: nextEventId(),
        ts,
        placementId: placement.id,
        clientId: placement.clientId,
        type: "conversation_context",
        conversationSnippet:
          "User asked about weekend deals and free delivery thresholds.",
      });
      return;
    }

    const spike = tick % 14 === 0;
    onEvent({
      id: nextEventId(),
      ts,
      placementId: placement.id,
      clientId: placement.clientId,
      type: "spend_tick",
      spendGbp: spike ? randomSpend() * 4 : randomSpend(),
      conversions: Math.random() > 0.7 ? 1 : 0,
    });
  };

  return {
    start() {
      if (timer) return;
      timer = setInterval(emitTick, TICK_MS);
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = null;
    },
  };
}

export function getFixturePlacements(): Placement[] {
  return placementsFixture as Placement[];
}
