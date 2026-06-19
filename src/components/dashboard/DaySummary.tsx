"use client";

import dynamic from "next/dynamic";
import { useMemo, type ReactNode } from "react";
import { computeDaySummary, type AdvertiserHealth } from "@/lib/spend/day-summary";
import { CLIENT_ACCENT, formatGbp } from "@/lib/format";
import { useDashboardStore } from "@/lib/store/dashboard-store";

const DaySummaryCharts = dynamic(
  () =>
    import("./DaySummaryCharts").then((m) => ({ default: m.DaySummaryCharts })),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 border-t border-[var(--border-subtle)] p-4 sm:grid-cols-2 sm:p-5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-[248px] animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inset)]"
          />
        ))}
      </div>
    ),
  },
);

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

const KPI_ICONS: Record<string, ReactNode> = {
  "Budget used": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  "Active placements": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  "Open alerts": (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Advertisers: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-[18px] border border-[var(--border-subtle)] bg-white px-5 py-4"
      style={{ boxShadow: "var(--shadow-panel)" }}
    >
      <div className="card-shimmer" />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {label}
        </p>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inset)] text-[var(--text-muted)]"
          style={{ boxShadow: "var(--shadow-sm)" }}
        >
          {KPI_ICONS[label]}
        </span>
      </div>
      <p className="font-mono-data mt-3 text-[1.75rem] font-bold leading-none text-[var(--text-primary)]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-[11.5px] text-[var(--text-muted)]">{hint}</p>
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
      <div className="border-b border-[var(--border-subtle)] bg-gradient-to-br from-[var(--accent-dim)] via-transparent to-[var(--blue-dim)]/30 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Today across advertisers
            </p>
            <h2
              id="day-summary-heading"
              className="font-display mt-1 text-xl font-bold text-[var(--text-primary)]"
            >
              {summary.dateLabel}
            </h2>
            <p className="mt-2 max-w-xl text-[13px] text-[var(--text-secondary)]">
              {summary.headline}
            </p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{summary.subline}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Portfolio spend
            </p>
            <p className="font-mono-data mt-1 text-[2rem] font-bold leading-none text-[var(--text-primary)]">
              {formatGbp(summary.totalSpendGbp)}
            </p>
            <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">
              of {formatGbp(summary.totalBudgetGbp)} budget
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
        <Kpi label="Budget used" value={`${summary.budgetPct}%`} hint="Combined daily caps" />
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
        <Kpi label="Advertisers" value={String(summary.advertisers.length)} hint="AI-channel book" />
      </div>

      <DaySummaryCharts
        portfolioHourly={summary.portfolioHourly}
        advertiserChart={summary.advertiserChart}
      />

      <div className="border-t border-[var(--border-subtle)] px-4 pb-4 sm:px-5 sm:pb-5">
        <p className="py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
          By advertiser
        </p>
        <ul className="space-y-2">
          {summary.advertisers.map((row, idx) => {
            const accent = CLIENT_ACCENT[idx % CLIENT_ACCENT.length] ?? CLIENT_ACCENT[0];
            return (
              <li
                key={row.clientId}
                className={`flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-inset)]/50 px-4 py-3 border-l-[3px] ${accent}`}
              >
                <div className="min-w-[140px] flex-1">
                  <p className="text-[15px] font-semibold text-[var(--text-primary)]">{row.name}</p>
                  <p className="text-[11px] capitalize text-[var(--text-muted)]">
                    {row.tier} · {row.placementsActive}/{row.placementsTotal} active
                    {row.placementsPaused > 0 ? ` · ${row.placementsPaused} paused` : ""}
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
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
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
                  <span className={`chip border ${HEALTH_STYLE[row.health]}`}>
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
