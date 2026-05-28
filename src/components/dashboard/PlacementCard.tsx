"use client";

import {
  healthTone,
  spendVelocityGbpPerHr,
} from "@/lib/spend/metrics";
import { channelLabel, formatGbp, statusLabel } from "@/lib/format";
import type { Placement } from "@/types";
import type { PlacementLiveState } from "@/types/stream";
import { SpendSparkline } from "./SpendSparkline";

interface PlacementCardProps {
  placement: Placement;
  state?: PlacementLiveState;
}

const TONE_STYLES = {
  calm: {
    ring: "ring-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-400",
    dot: "bg-emerald-400",
  },
  elevated: {
    ring: "ring-amber-500/30",
    badge: "bg-amber-500/15 text-amber-400",
    dot: "bg-amber-400",
  },
  critical: {
    ring: "ring-red-500/40",
    badge: "bg-red-500/15 text-red-400",
    dot: "bg-red-400",
  },
} as const;

export function PlacementCard({ placement, state }: PlacementCardProps) {
  const buckets = state?.hourlyBuckets ?? [];
  const tone = healthTone(buckets, placement.status);
  const styles = TONE_STYLES[tone];
  const velocity = spendVelocityGbpPerHr(buckets);
  const daily = state?.dailySpendGbp ?? 0;

  return (
    <article
      className={`rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 ring-1 ${styles.ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium text-zinc-100">
            {placement.name}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {channelLabel(placement.channel)}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${styles.badge}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          {statusLabel(placement.status)}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-zinc-500">Today</p>
          <p className="text-lg font-semibold tabular-nums text-zinc-100">
            {formatGbp(daily)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Velocity{" "}
            <span className="tabular-nums text-zinc-300">
              {formatGbp(velocity)}/hr
            </span>
          </p>
        </div>
        <SpendSparkline buckets={buckets.length ? buckets : Array(12).fill(0)} />
      </div>
    </article>
  );
}
