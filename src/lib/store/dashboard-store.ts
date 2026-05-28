"use client";

import { create } from "zustand";
import type {
  Alert,
  AlertStatus,
  Client,
  DemoScenarioId,
  Investigation,
  Placement,
} from "@/types";
import type { PlacementLiveState, StreamMessage } from "@/types/stream";

interface DashboardState {
  connected: boolean;
  clients: Client[];
  placements: Placement[];
  states: Record<string, PlacementLiveState>;
  alerts: Alert[];
  investigations: Record<string, Investigation>;
  activeInvestigationId: string | null;
  gateAlertId: string | null;
  scenarioLoading: DemoScenarioId | null;
  setConnected: (connected: boolean) => void;
  selectInvestigation: (id: string | null) => void;
  openGate: (alertId: string) => void;
  closeGate: () => void;
  applyMessage: (msg: StreamMessage) => void;
  resolveAlert: (id: string, status: AlertStatus) => Promise<void>;
  runScenario: (id: DemoScenarioId) => Promise<void>;
  resetDemo: () => Promise<void>;
}

const MAX_ALERTS = 50;

export const useDashboardStore = create<DashboardState>((set) => ({
  connected: false,
  clients: [],
  placements: [],
  states: {},
  alerts: [],
  investigations: {},
  activeInvestigationId: null,
  gateAlertId: null,
  scenarioLoading: null,
  setConnected: (connected) => set({ connected }),
  selectInvestigation: (id) => set({ activeInvestigationId: id }),
  openGate: (alertId) => {
    const alert = useDashboardStore.getState().alerts.find((a) => a.id === alertId);
    set({
      gateAlertId: alertId,
      activeInvestigationId: alert?.investigationId ?? null,
    });
  },
  closeGate: () => set({ gateAlertId: null }),
  resolveAlert: async (id, status) => {
    await fetch("/api/alerts/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
      gateAlertId: s.gateAlertId === id ? null : s.gateAlertId,
    }));
  },
  runScenario: async (id) => {
    set({ scenarioLoading: id });
    try {
      await fetch("/api/demo/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: id }),
      });
    } finally {
      set({ scenarioLoading: null });
    }
  },
  resetDemo: async () => {
    await fetch("/api/demo/reset", { method: "POST" });
  },
  applyMessage: (msg) => {
    switch (msg.type) {
      case "init":
        set({
          clients: msg.clients,
          placements: msg.placements,
          states: Object.fromEntries(
            msg.states.map((s) => [s.placementId, s]),
          ),
          alerts: [],
          investigations: {},
          activeInvestigationId: null,
          gateAlertId: null,
        });
        break;
      case "spend":
        set((s) => ({
          states: { ...s.states, [msg.state.placementId]: msg.state },
        }));
        break;
      case "investigation":
        set((s) => ({
          investigations: {
            ...s.investigations,
            [msg.investigation.id]: msg.investigation,
          },
          activeInvestigationId: msg.investigation.id,
        }));
        break;
      case "alert":
        set((s) => {
          const alerts = [msg.alert, ...s.alerts].slice(0, MAX_ALERTS);
          const activeInvestigationId =
            msg.alert.investigationId ?? s.activeInvestigationId;
          const gateAlertId =
            msg.alert.status === "pending_human" && msg.alert.requiresHuman
              ? msg.alert.id
              : s.gateAlertId;
          return { alerts, activeInvestigationId, gateAlertId };
        });
        break;
      case "alert_status":
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === msg.id ? { ...a, status: msg.status } : a,
          ),
        }));
        break;
      case "placements_paused":
        set((s) => {
          const placements = s.placements.map((p) =>
            msg.placementIds.includes(p.id)
              ? { ...p, status: "paused" as const }
              : p,
          );
          const states = { ...s.states };
          for (const id of msg.placementIds) {
            const st = states[id];
            if (st) states[id] = { ...st, status: "paused" };
          }
          return { placements, states };
        });
        break;
    }
  },
}));

/** Pure helpers — use with useMemo in components (avoids unstable selector refs). */
export function filterGuardrailAlerts(alerts: Alert[]) {
  return alerts.filter((a) => a.source === "guardrail");
}

export function filterOpenAlerts(alerts: Alert[]) {
  return alerts.filter(
    (a) => a.status === "open" || a.status === "pending_human",
  );
}

export function computeEscalationStats(alerts: Alert[]) {
  return {
    signals: alerts.length,
    escalations: alerts.filter((a) => a.requiresHuman).length,
    pending: alerts.filter((a) => a.status === "pending_human").length,
  };
}

export function useActiveInvestigation(): Investigation | null {
  const id = useDashboardStore((s) => s.activeInvestigationId);
  const investigations = useDashboardStore((s) => s.investigations);
  return id ? (investigations[id] ?? null) : null;
}
