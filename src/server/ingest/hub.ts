import { emptyHourlyBuckets, pushSpendToBuckets } from "@/lib/spend/metrics";
import clientsFixture from "@/server/mock/fixtures/clients.json";
import { buildScenarioEvents } from "@/server/mock/scenarios";
import { createMockStream, getFixturePlacements } from "@/server/mock/stream";
import { SpendAccumulator } from "@/server/guardrails/accumulator";
import { evaluateGuardrails } from "@/server/guardrails/evaluate";
import type {
  Alert,
  AlertStatus,
  Client,
  Placement,
  SpendEvent,
} from "@/types";
import type { PlacementLiveState, StreamMessage } from "@/types/stream";

type Subscriber = (msg: StreamMessage) => void;

class IngestHub {
  private subscribers = new Set<Subscriber>();
  private placements: Placement[] = getFixturePlacements();
  private readonly clients: Client[] = clientsFixture as Client[];
  private readonly states = new Map<string, PlacementLiveState>();
  private readonly alerts: Alert[] = [];
  private readonly accumulator = new SpendAccumulator();
  private mockStream: ReturnType<typeof createMockStream> | null = null;
  private started = false;

  constructor() {
    for (const p of this.placements) {
      this.states.set(p.id, {
        placementId: p.id,
        status: p.status,
        dailySpendGbp: 0,
        hourlyBuckets: emptyHourlyBuckets(),
      });
    }
  }

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    fn(this.snapshotInit());
    this.ensureStarted();
    return () => this.subscribers.delete(fn);
  }

  private ensureStarted() {
    if (this.started) return;
    this.started = true;
    this.mockStream = createMockStream(
      () => this.placements,
      (event) => this.ingest(event),
    );
    this.mockStream.start();
  }

  private broadcast(msg: StreamMessage) {
    for (const fn of this.subscribers) fn(msg);
  }

  private snapshotInit(): StreamMessage {
    return {
      type: "init",
      clients: this.clients,
      placements: [...this.placements],
      states: [...this.states.values()],
    };
  }

  private ingest(event: SpendEvent) {
    const state = this.states.get(event.placementId);
    if (!state) return;

    if (event.type === "spend_tick" && event.spendGbp) {
      state.dailySpendGbp += event.spendGbp;
      state.hourlyBuckets = pushSpendToBuckets(
        state.hourlyBuckets,
        event.ts,
        event.spendGbp,
      );
    }

    const { alert, pausePlacementIds } = evaluateGuardrails(event, {
      accumulator: this.accumulator,
      pausedPlacementIds: new Set(
        this.placements.filter((p) => p.status === "paused").map((p) => p.id),
      ),
    });

    this.broadcast({ type: "spend", event, state: { ...state } });

    if (!alert) return;

    this.alerts.unshift(alert);
    const toPause = resolvePauseTargets(
      alert,
      pausePlacementIds,
      this.placements,
      event.clientId,
    );
    if (toPause.length > 0) this.pausePlacements(toPause, alert.title);
    this.broadcast({ type: "alert", alert });
  }

  private pausePlacements(ids: string[], reason: string) {
    const idSet = new Set(ids);
    for (const p of this.placements) {
      if (!idSet.has(p.id)) continue;
      p.status = "paused";
      const st = this.states.get(p.id);
      if (st) st.status = "paused";
    }
    this.broadcast({
      type: "placements_paused",
      placementIds: ids,
      reason,
    });
  }

  inject(event: SpendEvent) {
    this.ingest(event);
  }

  runScenario(id: Parameters<typeof buildScenarioEvents>[0]) {
    for (const e of buildScenarioEvents(id, this.placements)) this.inject(e);
  }

  resolveAlert(id: string, status: AlertStatus) {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) return;
    alert.status = status;
    this.broadcast({ type: "alert_status", id, status });
  }

  reset() {
    this.placements = getFixturePlacements().map((p) => ({ ...p, status: "active" as const }));
    this.alerts.length = 0;
    this.accumulator.reset();
    for (const p of this.placements) {
      this.states.set(p.id, {
        placementId: p.id,
        status: p.status,
        dailySpendGbp: 0,
        hourlyBuckets: emptyHourlyBuckets(),
      });
    }
    this.broadcast(this.snapshotInit());
  }

  getPlacements(): Placement[] {
    return [...this.placements];
  }
}

function resolvePauseTargets(
  alert: Alert,
  explicitIds: string[],
  placements: Placement[],
  clientId: string,
): string[] {
  if (explicitIds.length > 0) return explicitIds;
  if (alert.title.includes("Global daily cap")) {
    return placements.filter((p) => p.status === "active").map((p) => p.id);
  }
  if (alert.title.includes("Client budget cap")) {
    return placements
      .filter((p) => p.status === "active" && p.clientId === clientId)
      .map((p) => p.id);
  }
  return [];
}

declare global {
  // eslint-disable-next-line no-var
  var __sentinelHub: IngestHub | undefined;
}

export function getIngestHub(): IngestHub {
  if (!globalThis.__sentinelHub) {
    globalThis.__sentinelHub = new IngestHub();
  }
  return globalThis.__sentinelHub;
}
