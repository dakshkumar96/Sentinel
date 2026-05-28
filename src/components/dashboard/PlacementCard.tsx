"use client";

import {
  healthTone,
  spendVelocityGbpPerHr,
} from "@/lib/spend/metrics";
import {
  CHANNEL_STYLE,
  channelLabel,
  formatGbp,
  statusLabel,
} from "@/lib/format";
import type { Placement } from "@/types";
import type { PlacementLiveState } from "@/types/stream";
import { SpendSparkline } from "./SpendSparkline";

interface PlacementCardProps {
  placement: Placement;
  state?: PlacementLiveState;
}

const TONE_STYLES = {
  calm: {
    glow: "shadow-[0_0_0_1px_var(--accent-glow)]",
    badge: "bg-[var(--green-dim)] text-[var(--green)] border-[var(--green)]/20",
    dot: "bg-[var(--green)]",
  },
  elevated: {
    glow: "shadow-[0_0_0_1px_rgba(184,134,11,0.25)]",
    badge: "bg-[var(--warm-dim)] text-[var(--warm)] border-[var(--warm)]/25",
    dot: "bg-[var(--warm)]",
  },
  critical: {
    glow: "shadow-[0_0_0_1px_rgba(196,76,76,0.3)]",
    badge: "bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger)]/25",
    dot: "bg-[var(--danger)]",
  },
} as const;

export function PlacementCard({ placement, state }: PlacementCardProps) {
  const buckets = state?.hourlyBuckets ?? [];
  const tone = healthTone(buckets, placement.status);
  const styles = TONE_STYLES[tone];
  const channel = CHANNEL_STYLE[placement.channel];
  const velocity = spendVelocityGbpPerHr(buckets);
  const daily = state?.dailySpendGbp ?? 0;

  return (
    <article
      className={`panel-inset min-h-[168px] transition-shadow hover:shadow-md ${styles.glow}`}
    >
      <div
        className={`h-0.5 w-full bg-gradient-to-r ${channel.line}`}
        aria-hidden
      />
      <div className="flex h-full flex-col p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-snug text-[var(--text-primary)]">
              {placement.name}
            </h3>
            <span
              className={`chip mt-2 border ${channel.chip}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${channel.dot}`} />
              {channelLabel(placement.channel)}
            </span>
          </div>
          <span
            className={`chip shrink-0 border ${styles.badge}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
            {statusLabel(placement.status)}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Today
            </p>
            <p className="font-mono-data mt-0.5 text-xl font-medium text-[var(--text-primary)]">
              {formatGbp(daily)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              <span className="font-mono-data text-[var(--text-secondary)]">
                {formatGbp(velocity)}
              </span>
              /hr
            </p>
          </div>
          <SpendSparkline
            buckets={buckets.length ? buckets : Array(12).fill(0)}
            spike={tone !== "calm"}
          />
        </div>
      </div>
    </article>
  );
}
