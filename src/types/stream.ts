import type {
  Alert,
  AlertStatus,
  Client,
  Investigation,
  Placement,
  SpendEvent,
} from "./index";

export interface PlacementLiveState {
  placementId: string;
  status: Placement["status"];
  dailySpendGbp: number;
  hourlyBuckets: number[];
}

export type StreamMessage =
  | {
      type: "init";
      clients: Client[];
      placements: Placement[];
      states: PlacementLiveState[];
      agentEngine: "claude" | "mock";
    }
  | { type: "spend"; event: SpendEvent; state: PlacementLiveState }
  | { type: "alert"; alert: Alert }
  | { type: "alert_status"; id: string; status: AlertStatus }
  | { type: "investigation"; investigation: Investigation }
  | {
      type: "placements_paused";
      placementIds: string[];
      reason: string;
    };
