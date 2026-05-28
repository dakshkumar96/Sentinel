import { emptyHourlyBuckets, pushSpendToBuckets } from "@/lib/spend/metrics";
import { createAuditEntry, type AuditEntry } from "@/server/audit/log";
import { hasClaudeApiKey } from "@/server/agent/claude";
import { AGENT_SCENARIOS } from "@/server/agent/investigations";
import { runInvestigation } from "@/server/agent/orchestrator";
import clientsFixture from "@/server/mock/fixtures/clients.json";
import { buildScenarioEvents } from "@/server/mock/scenarios";
import { createMockStream, getFixturePlacements } from "@/server/mock/stream";
import { SpendAccumulator } from "@/server/guardrails/accumulator";
import { evaluateGuardrails } from "@/server/guardrails/evaluate";
import type {
  Alert,
  AlertStatus,
  Client,
  DemoScenarioId,
  Investigation,
  Placement,
  SpendEvent,
} from "@/types";
import type { PlacementLiveState, StreamMessage } from "@/types/stream";

type Subscriber = (msg: StreamMessage) => void;

const AGENT_SCENARIO_SET = new Set<DemoScenarioId>(AGENT_SCENARIOS);

class IngestHub {
  private subscribers = new Set<Subscriber>();
  private placements: Placement[] = getFixturePlacements();
  private readonly clients: Client[] = clientsFixture as Client[];
  private readonly states = new Map<string, PlacementLiveState>();
  private readonly alerts: Alert[] = [];
  private readonly investigations = new Map<string, Investigation>();
  private readonly auditLog: AuditEntry[] = [];
  private readonly accumulator = new SpendAccumulator();
  private mockStream: ReturnType<typeof createMockStream> | null = null;
  private started = false;
  private alertSeq = 0;

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

  private nextAlertId(): string {
    this.alertSeq += 1;
    return `alt_${Date.now()}_${this.alertSeq}`;
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

    this.emitAlert(alert, pausePlacementIds, event.clientId);
  }

  private emitAlert(
    alert: Alert,
    pausePlacementIds: string[],
    clientId: string,
  ) {
    this.alerts.unshift(alert);
    this.pushAudit(
      "alert_created",
      `${alert.source}: ${alert.title}`,
      { alertId: alert.id, source: alert.source, severity: alert.severity },
    );
    const toPause = resolvePauseTargets(
      alert,
      pausePlacementIds,
      this.placements,
      clientId,
    );
    if (toPause.length > 0) this.pausePlacements(toPause, alert.title);
    this.broadcast({ type: "alert", alert });
  }

  private pushAudit(
    kind: Parameters<typeof createAuditEntry>[0],
    summary: string,
    payload: Record<string, unknown>,
  ) {
    this.auditLog.unshift(createAuditEntry(kind, summary, payload));
    if (this.auditLog.length > 200) this.auditLog.length = 200;
  }

  private pausePlacements(ids: string[], reason: string) {
    const idSet = new Set(ids);
    for (const p of this.placements) {
      if (!idSet.has(p.id)) continue;
      p.status = "paused";
      const st = this.states.get(p.id);
      if (st) st.status = "paused";
    }
    this.pushAudit("placement_paused", reason, { placementIds: ids });
    this.broadcast({
      type: "placements_paused",
      placementIds: ids,
      reason,
    });
  }

  inject(event: SpendEvent) {
    this.ingest(event);
  }

  runScenario(id: DemoScenarioId) {
    const target = pickScenarioPlacement(this.placements);
    if (!target) return;

    for (const e of buildScenarioEvents(id, this.placements)) {
      this.ingest(e);
    }

    if (AGENT_SCENARIO_SET.has(id)) {
      void this.runAgentScenario(id, target);
    }
  }

  private async runAgentScenario(
    scenarioId: DemoScenarioId,
    placement: Placement,
  ) {
    const alertId = this.nextAlertId();
    const exposureGbp =
      scenarioId === "zero_conv_burn"
        ? 340
        : scenarioId === "bad_spike" || scenarioId === "healthy_spike"
          ? 88
          : 120;

    const investigation = await runInvestigation({
      scenarioId,
      alertId,
      placementId: placement.id,
      clientId: placement.clientId,
      exposureGbp,
      brandSafetyAmbiguous: scenarioId === "brand_safety",
    });

    this.investigations.set(investigation.id, investigation);
    this.pushAudit("investigation_complete", investigation.reasoning, {
      investigationId: investigation.id,
      verdict: investigation.verdict,
      confidence: investigation.confidence,
      engine: investigation.signal.includes("claude") ? "claude" : "mock",
      claudeAvailable: hasClaudeApiKey(),
    });
    this.broadcast({ type: "investigation", investigation });

    const alert = buildAgentAlert(
      alertId,
      placement,
      investigation,
      scenarioId,
    );
    this.alerts.unshift(alert);
    this.pushAudit("alert_created", alert.title, {
      alertId: alert.id,
      investigationId: investigation.id,
      requiresHuman: alert.requiresHuman,
    });
    this.broadcast({ type: "alert", alert });
  }

  resolveAlert(id: string, status: AlertStatus) {
    const alert = this.alerts.find((a) => a.id === id);
    if (!alert) return;

    alert.status = status;
    this.pushAudit("alert_resolved", `${alert.title} → ${status}`, {
      alertId: id,
      status,
      source: alert.source,
    });

    if (
      status === "approved" &&
      alert.recommendedAction === "pause" &&
      alert.placementId
    ) {
      this.pausePlacements([alert.placementId], alert.title);
    }

    this.broadcast({ type: "alert_status", id, status });
  }

  reset() {
    this.placements = getFixturePlacements().map((p) => ({
      ...p,
      status: "active" as const,
    }));
    this.alerts.length = 0;
    this.investigations.clear();
    this.auditLog.length = 0;
    this.pushAudit("demo_reset", "Dashboard reset to calm state", {});
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

  getInvestigation(id: string): Investigation | undefined {
    return this.investigations.get(id);
  }

  getAuditSnapshot() {
    return {
      exportedAt: new Date().toISOString(),
      agentEngine: hasClaudeApiKey() ? "claude" : "mock",
      entries: [...this.auditLog],
      alerts: [...this.alerts],
      investigations: [...this.investigations.values()],
    };
  }
}

function pickScenarioPlacement(placements: Placement[]): Placement | null {
  const active = placements.filter((p) => p.status === "active");
  return active.find((p) => p.clientId === "acme_retail") ?? active[0] ?? null;
}

function buildAgentAlert(
  id: string,
  placement: Placement,
  investigation: Investigation,
  scenarioId: DemoScenarioId,
): Alert {
  const titles: Record<string, string> = {
    healthy_spike: "Spend spike — healthy scaling",
    bad_spike: "Spend spike — conversion flat",
    brand_safety: "Brand-safety review",
    zero_conv_burn: "Zero-conversion burn",
  };

  const requiresHuman = investigation.requiresHuman;
  const status = requiresHuman ? "pending_human" : "resolved";

  return {
    id,
    ts: new Date().toISOString(),
    clientId: placement.clientId,
    placementId: placement.id,
    source: "agent",
    severity: requiresHuman ? "warning" : "info",
    title: titles[scenarioId] ?? "Agent signal",
    summary: investigation.reasoning,
    status,
    investigationId: investigation.id,
    recommendedAction: investigation.recommendedAction,
    requiresHuman,
  };
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
