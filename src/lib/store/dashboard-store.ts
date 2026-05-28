import { create } from "zustand";
import type { Alert, AlertStatus, Client, DemoScenarioId, Placement } from "@/types";
import type { PlacementLiveState, StreamMessage } from "@/types/stream";

interface DashboardState {
  connected: boolean;
  clients: Client[];
  placements: Placement[];
  states: Record<string, PlacementLiveState>;
  alerts: Alert[];
  scenarioLoading: DemoScenarioId | null;
  setConnected: (connected: boolean) => void;
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
  scenarioLoading: null,
  setConnected: (connected) => set({ connected }),
  resolveAlert: async (id, status) => {
    await fetch("/api/alerts/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)),
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
        });
        break;
      case "spend":
        set((s) => ({
          states: { ...s.states, [msg.state.placementId]: msg.state },
        }));
        break;
      case "alert":
        set((s) => ({
          alerts: [msg.alert, ...s.alerts].slice(0, MAX_ALERTS),
        }));
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

export const selectGuardrailAlerts = (s: DashboardState) =>
  s.alerts.filter((a) => a.source === "guardrail");
