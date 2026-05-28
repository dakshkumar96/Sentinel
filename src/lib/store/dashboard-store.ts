"use client";

import { create } from "zustand";
import type {
  Alert,
  Client,
  Placement,
} from "@/types";
import type { PlacementMetrics, StreamMessage } from "@/types/dashboard";

interface DashboardState {
  connected: boolean;
  clients: Client[];
  placements: Placement[];
  metrics: Record<string, PlacementMetrics>;
  alerts: Alert[];
  scenarioLoading: string | null;

  connect: () => void;
  disconnect: () => void;
  runScenario: (id: string) => Promise<void>;
  resetDemo: () => Promise<void>;
  resolveAlert: (id: string, status: Alert["status"]) => Promise<void>;
}

let eventSource: EventSource | null = null;

function applyMessage(
  set: (fn: (s: DashboardState) => Partial<DashboardState>) => void,
  msg: StreamMessage,
) {
  switch (msg.type) {
    case "snapshot":
      set(() => ({
        clients: msg.data.clients,
        placements: msg.data.placements,
        metrics: msg.data.metrics,
        alerts: msg.data.alerts,
      }));
      break;
    case "spend_event":
      break;
    case "metrics":
      set((s) => ({
        metrics: { ...s.metrics, [msg.data.placementId]: msg.data.metrics },
      }));
      break;
    case "placement_status":
      set((s) => ({
        placements: s.placements.map((p) =>
          p.id === msg.data.placementId
            ? { ...p, status: msg.data.status }
            : p,
        ),
      }));
      break;
    case "alert": {
      set((s) => {
        const idx = s.alerts.findIndex((a) => a.id === msg.data.id);
        const alerts =
          idx >= 0
            ? s.alerts.map((a, i) => (i === idx ? msg.data : a))
            : [msg.data, ...s.alerts];
        return { alerts };
      });
      break;
    }
  }
}

export const useDashboardStore = create<DashboardState>((set) => ({
  connected: false,
  clients: [],
  placements: [],
  metrics: {},
  alerts: [],
  scenarioLoading: null,

  connect: () => {
    if (eventSource) return;
    const es = new EventSource("/api/events/stream");
    eventSource = es;

    es.onopen = () => set({ connected: true });
    es.onerror = () => set({ connected: false });

    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as StreamMessage;
        applyMessage(set, msg);
      } catch {
        /* ignore parse errors */
      }
    };
  },

  disconnect: () => {
    eventSource?.close();
    eventSource = null;
    set({ connected: false });
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

  resolveAlert: async (id, status) => {
    await fetch("/api/alerts/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  },
}));

export function useClientMap() {
  const clients = useDashboardStore((s) => s.clients);
  return Object.fromEntries(clients.map((c) => [c.id, c]));
}
