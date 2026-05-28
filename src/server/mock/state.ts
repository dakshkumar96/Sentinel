import type { Alert, Client, Placement, SpendEvent } from "@/types";
import type {
  DashboardSnapshot,
  HealthStatus,
  PlacementMetrics,
  StreamMessage,
} from "@/types/dashboard";
import clientsFixture from "./fixtures/clients.json";
import placementsFixture from "./fixtures/placements.json";

export type { DashboardSnapshot, PlacementMetrics, StreamMessage };

type Subscriber = (msg: StreamMessage) => void;

const HISTORY_LEN = 24;
const BASELINE_VELOCITY = 45;

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

const clients = clientsFixture as Client[];
const placements = placementsFixture as Placement[];

const metrics: Record<string, PlacementMetrics> = {};
const alerts: Alert[] = [];
const subscribers = new Set<Subscriber>();

let baselineTimer: ReturnType<typeof setInterval> | null = null;

function initMetrics() {
  for (const p of placements) {
    const seed = Array.from({ length: HISTORY_LEN }, () =>
      Math.round(8 + Math.random() * 25),
    );
    metrics[p.id] = {
      spendTodayGbp: Math.round(120 + Math.random() * 280),
      spendHistory: seed,
      conversionsToday: Math.floor(3 + Math.random() * 12),
      spendVelocityPerHr: BASELINE_VELOCITY,
      health: "healthy",
    };
  }
}

initMetrics();

function emit(msg: StreamMessage) {
  for (const sub of subscribers) sub(msg);
}

function snapshot(): DashboardSnapshot {
  return {
    clients,
    placements: placements.map((p) => ({ ...p })),
    metrics: Object.fromEntries(
      Object.entries(metrics).map(([k, v]) => [k, { ...v, spendHistory: [...v.spendHistory] }]),
    ),
    alerts: [...alerts],
  };
}

function pushHistory(placementId: string, tickGbp: number) {
  const m = metrics[placementId];
  if (!m) return;
  m.spendHistory.push(tickGbp);
  if (m.spendHistory.length > HISTORY_LEN) m.spendHistory.shift();
}

export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn);
  fn({ type: "snapshot", data: snapshot() });
  return () => subscribers.delete(fn);
}

export function getPlacement(id: string): Placement | undefined {
  return placements.find((p) => p.id === id);
}

export function emitSpendTick(
  placementId: string,
  spendGbp: number,
  conversions = 0,
) {
  const placement = getPlacement(placementId);
  if (!placement) return;

  const m = metrics[placementId];
  m.spendTodayGbp = Math.round((m.spendTodayGbp + spendGbp) * 100) / 100;
  m.conversionsToday += conversions;
  pushHistory(placementId, spendGbp);

  const event: SpendEvent = {
    id: nextId("evt"),
    ts: new Date().toISOString(),
    placementId,
    clientId: placement.clientId,
    type: conversions > 0 ? "conversion" : "spend_tick",
    spendGbp,
    conversions: conversions > 0 ? conversions : undefined,
  };

  emit({ type: "spend_event", data: event });
  emit({
    type: "metrics",
    data: { placementId, metrics: { ...m, spendHistory: [...m.spendHistory] } },
  });
}

export function setPlacementHealth(placementId: string, health: HealthStatus) {
  const m = metrics[placementId];
  if (!m) return;
  m.health = health;
  emit({
    type: "metrics",
    data: { placementId, metrics: { ...m, spendHistory: [...m.spendHistory] } },
  });
}

export function setVelocity(placementId: string, perHr: number) {
  const m = metrics[placementId];
  if (!m) return;
  m.spendVelocityPerHr = perHr;
  emit({
    type: "metrics",
    data: { placementId, metrics: { ...m, spendHistory: [...m.spendHistory] } },
  });
}

export function setPlacementStatus(
  placementId: string,
  status: Placement["status"],
) {
  const p = placements.find((x) => x.id === placementId);
  if (!p) return;
  p.status = status;
  emit({ type: "placement_status", data: { placementId, status } });
}

export function addAlert(partial: Omit<Alert, "id" | "ts">): Alert {
  const alert: Alert = {
    id: nextId("alert"),
    ts: new Date().toISOString(),
    ...partial,
  };
  alerts.unshift(alert);
  if (alerts.length > 50) alerts.pop();
  emit({ type: "alert", data: alert });
  return alert;
}

export function resolveAlert(alertId: string, status: Alert["status"]) {
  const a = alerts.find((x) => x.id === alertId);
  if (!a) return;
  a.status = status;
  emit({ type: "alert", data: { ...a } });
}

function pickRandomPlacement(): Placement {
  return placements[Math.floor(Math.random() * placements.length)];
}

export function startBaselineStream() {
  if (baselineTimer) return;
  baselineTimer = setInterval(() => {
    const p = pickRandomPlacement();
    const m = metrics[p.id];
    if (m.health !== "healthy") return;
    const tick = Math.round((3 + Math.random() * 12) * 100) / 100;
    const conv = Math.random() > 0.82 ? 1 : 0;
    emitSpendTick(p.id, tick, conv);
  }, 2200);
}

export function stopBaselineStream() {
  if (baselineTimer) {
    clearInterval(baselineTimer);
    baselineTimer = null;
  }
}

export function resetToHealthy() {
  for (const p of placements) {
    metrics[p.id].health = "healthy";
    metrics[p.id].spendVelocityPerHr = BASELINE_VELOCITY;
    if (p.status === "paused") p.status = "active";
    emit({
      type: "metrics",
      data: {
        placementId: p.id,
        metrics: { ...metrics[p.id], spendHistory: [...metrics[p.id].spendHistory] },
      },
    });
    emit({ type: "placement_status", data: { placementId: p.id, status: p.status } });
  }
  alerts.length = 0;
  emit({ type: "snapshot", data: snapshot() });
}

export { clients, placements, metrics, alerts };
