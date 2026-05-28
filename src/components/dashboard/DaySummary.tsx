"use client";

import { useMemo } from "react";
import { computeDaySummary, type AdvertiserHealth } from "@/lib/spend/day-summary";
import { CLIENT_ACCENT, formatGbp } from "@/lib/format";
import { useDashboardStore } from "@/lib/store/dashboard-store";
import { DaySummaryCharts } from "./DaySummaryCharts";

const HEALTH_LABEL: Record<AdvertiserHealth, string> = {
  calm: "On track",
  elevated: "Elevated",
  critical: "At risk",
};

const HEALTH_STYLE: Record<AdvertiserHealth, string> = {
  calm: "bg-[var(--green-dim)] text-[var(--green)] border-[var(--green)]/20",
  elevated: "bg-[var(--warm-dim)] text-[var(--warm)] border-[var(--warm)]/25",
  critical: "bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger)]/25",
};

const BAR_STYLE: Record<AdvertiserHealth, string> = {
  calm: "bg-[var(--green)]",
  elevated: "bg-[var(--warm)]",
  critical: "bg-[var(--danger)]",
};

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="font-mono-data mt-1 text-xl font-medium text-[var(--text-primary)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function DaySummary() {
  const clients = useDashboardStore((s) => s.clients);
  const placements = useDashboardStore((s) => s.placements);
  const states = useDashboardStore((s) => s.states);
  const alerts = useDashboardStore((s) => s.alerts);

  const summary = useMemo(
    () => computeDaySummary(clients, placements, states, alerts),
    [clients, placements, states, alerts],
  );

  if (clients.length === 0) return null;

  return (
    <section className="panel overflow-hidden" aria-labelledby="day-summary-heading">
      <div className="border-b border-[var(--border-subtle)] bg-gradient-to-r from-[var(--accent-dim)] to-transparent px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Today across advertisers
            </p>
            <h2
              id="day-summary-heading"
              className="font-display mt-1 text-lg font-semibold text-[var(--text-primary)] sm:text-xl"
            >
              {summary.dateLabel}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">
              {summary.headline}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{summary.subline}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Portfolio spend
            </p>
            <p className="font-mono-data text-2xl font-semibold text-[var(--text-primary)]">
              {formatGbp(summary.totalSpendGbp)}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              of {formatGbp(summary.totalBudgetGbp)} budget
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
        <Kpi
          label="Budget used"
          value={`${summary.budgetPct}%`}
          hint="Combined daily caps"
        />
        <Kpi
          label="Active placements"
          value={String(summary.activePlacements)}
          hint={
            summary.pausedPlacements > 0
              ? `${summary.pausedPlacements} paused`
              : summary.learningPlacements > 0
                ? `${summary.learningPlacements} in learning`
                : "All channels live"
          }
        />
        <Kpi
          label="Open alerts"
          value={String(summary.openAlerts)}
          hint={
            summary.pendingHuman > 0
              ? `${summary.pendingHuman} awaiting human`
              : "Guardrails + agent"
          }
        />
        <Kpi
          label="Advertisers"
          value={String(summary.advertisers.length)}
          hint="AI-channel book"
        />
      </div>

      <DaySummaryCharts
        portfolioHourly={summary.portfolioHourly}
        advertiserChart={summary.advertiserChart}
      />

      <div className="border-t border-[var(--border-subtle)] px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          By advertiser
        </p>
        <ul className="space-y-2">
          {summary.advertisers.map((row, idx) => {
            const accent =
              CLIENT_ACCENT[idx % CLIENT_ACCENT.length] ?? CLIENT_ACCENT[0];
            return (
              <li
                key={row.clientId}
                className={`flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inset)]/60 px-4 py-3 border-l-[3px] ${accent}`}
              >
                <div className="min-w-[140px] flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {row.name}
                  </p>
                  <p className="text-[11px] capitalize text-[var(--text-muted)]">
                    {row.tier} · {row.placementsActive}/{row.placementsTotal}{" "}
                    active
                    {row.placementsPaused > 0
                      ? ` · ${row.placementsPaused} paused`
                      : ""}
                  </p>
                </div>

                <div className="min-w-[120px] flex-1 sm:max-w-[200px]">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-mono-data text-[var(--text-secondary)]">
                      {formatGbp(row.spendGbp)}
                    </span>
                    <span className="text-[var(--text-muted)]">
                      {row.budgetPct}% of {formatGbp(row.budgetGbp)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${BAR_STYLE[row.health]}`}
                      style={{ width: `${row.budgetPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {row.openAlerts > 0 ? (
                    <span className="chip border border-[var(--accent)]/25 bg-[var(--accent-dim)] text-[var(--accent-strong)]">
                      {row.openAlerts} alert{row.openAlerts === 1 ? "" : "s"}
                    </span>
                  ) : null}
                  <span
                    className={`chip border ${HEALTH_STYLE[row.health]}`}
                  >
                    {HEALTH_LABEL[row.health]}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
