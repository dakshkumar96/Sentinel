export type DashboardView = "overview" | "agent" | "placements";

export const DASHBOARD_VIEWS: { id: DashboardView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "agent", label: "Agent" },
  { id: "placements", label: "Placements" },
];
