import type { Alert, Client, Placement, SpendEvent } from "./index";

export type HealthStatus = "healthy" | "warning" | "critical";

export interface PlacementMetrics {
  spendTodayGbp: number;
  spendHistory: number[];
  conversionsToday: number;
  spendVelocityPerHr: number;
  health: HealthStatus;
}

export interface DashboardSnapshot {
  clients: Client[];
  placements: Placement[];
  metrics: Record<string, PlacementMetrics>;
  alerts: Alert[];
}

export type StreamMessage =
  | { type: "snapshot"; data: DashboardSnapshot }
  | { type: "spend_event"; data: SpendEvent }
  | { type: "alert"; data: Alert }
  | { type: "metrics"; data: { placementId: string; metrics: PlacementMetrics } }
  | { type: "placement_status"; data: { placementId: string; status: Placement["status"] } };
