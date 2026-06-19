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
    ring: "",
    badge: "bg-[var(--green-dim)] text-[var(--green)] border-[var(--green)]/20",
    dot: "bg-[var(--green)]",
    label: null,
  },
  elevated: {
    ring: "shadow-[0_0_0_1.5px_rgba(146,97,10,0.35),0_0_14px_rgba(146,97,10,0.12)]",
    badge: "bg-[var(--warm-dim)] text-[var(--warm)] border-[var(--warm)]/25",
    dot: "bg-[var(--warm)] animate-pulse",
    label: "Spiking",
  },
  critical: {
    ring: "shadow-[0_0_0_1.5px_rgba(192,57,43,0.4),0_0_16px_rgba(192,57,43,0.15)]",
    badge: "bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger)]/25",
    dot: "bg-[var(--danger)] animate-pulse",
    label: "Critical",
  },
} as const;

export function PlacementCard({ placement, state }: PlacementCardProps) {
  const buckets = state?.hourlyBuckets ?? [];
  const tone = healthTone(buckets, placement.status);
  const styles = TONE_STYLES[tone];
  const channel = CHANNEL_STYLE[placement.channel];
  const velocity = spendVelocityGbpPerHr(buckets);
  const daily = state?.dailySpendGbp ?? 0;
  const isPaused = placement.status === "paused";

  return (
    <article
      className={`panel-inset relative min-h-[168px] bg-white transition-all duration-300 hover:shadow-md ${isPaused ? "opacity-70" : styles.ring}`}
      style={{ boxShadow: isPaused ? undefined : "var(--shadow-sm)" }}
    >
      <div className={`h-px w-full bg-gradient-to-r ${channel.line}`} aria-hidden />

      <div className="flex h-full flex-col p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3
              className={`text-[15px] font-semibold leading-snug ${
                isPaused ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"
              }`}
            >
              {placement.name}
            </h3>
            <span className={`chip mt-2 border ${channel.chip}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${channel.dot}`} />
              {channelLabel(placement.channel)}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`chip shrink-0 border ${styles.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
              {isPaused ? "Paused" : statusLabel(placement.status)}
            </span>
            {styles.label && !isPaused && (
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--warm)] animate-pulse">
                {styles.label}
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Today
            </p>
            <p
              className={`font-mono-data mt-0.5 text-xl font-bold ${
                isPaused ? "text-[var(--text-muted)]" : "text-[var(--text-primary)]"
              }`}
            >
              {formatGbp(daily)}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              <span
                className={`font-mono-data ${
                  isPaused ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"
                }`}
              >
                {isPaused ? "—" : formatGbp(velocity)}
              </span>
              {!isPaused && "/hr"}
            </p>
          </div>

          {isPaused ? (
            <div className="flex h-11 w-[120px] items-center justify-center rounded-lg bg-[var(--bg-inset)] text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Paused
            </div>
          ) : (
            <SpendSparkline
              buckets={buckets.length ? buckets : Array(12).fill(0)}
              spike={tone !== "calm"}
            />
          )}
        </div>
      </div>
    </article>
  );
}
