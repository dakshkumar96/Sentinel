"use client";

import type { Client, Placement } from "@/types";
import type { PlacementMetrics } from "@/types/dashboard";
import { formatChannel, formatGbp } from "@/lib/utils";
import { SpendSparkline } from "./SpendSparkline";

interface PlacementCardProps {
  placement: Placement;
  client?: Client;
  metrics?: PlacementMetrics;
}

const healthRing: Record<string, string> = {
  healthy: "ring-emerald-500/40",
  warning: "ring-amber-500/60 animate-pulse",
  critical: "ring-red-500/70 animate-pulse",
};

const statusLabel: Record<string, string> = {
  active: "Active",
  paused: "Paused",
  learning: "Learning",
};

export function PlacementCard({ placement, client, metrics }: PlacementCardProps) {
  const health = metrics?.health ?? "healthy";
  const isPaused = placement.status === "paused";

  return (
    <article
      className={`rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 ring-2 transition-shadow ${healthRing[health]} ${isPaused ? "opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-100">
            {placement.name}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{client?.name}</p>
        </div>
        <span className="shrink-0 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          {formatChannel(placement.channel)}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold tabular-nums text-zinc-50">
            {formatGbp(metrics?.spendTodayGbp ?? 0)}
          </p>
          <p className="text-xs text-zinc-500">spent today</p>
        </div>
        <SpendSparkline
          data={metrics?.spendHistory ?? []}
          health={health}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-3 border-t border-zinc-800/80 pt-3 text-xs">
        <span className="text-zinc-400">
          <span className="text-zinc-300">{metrics?.conversionsToday ?? 0}</span>{" "}
          conv.
        </span>
        <span className="text-zinc-400">
          <span className="text-zinc-300">~{metrics?.spendVelocityPerHr ?? 0}</span>
          /hr
        </span>
        <span
          className={
            placement.status === "active"
              ? "text-emerald-500"
              : placement.status === "paused"
                ? "text-red-400"
                : "text-amber-500"
          }
        >
          {statusLabel[placement.status]}
        </span>
      </div>
    </article>
  );
}
