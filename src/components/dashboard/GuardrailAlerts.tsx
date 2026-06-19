"use client";

import { useMemo } from "react";
import {
  filterGuardrailAlerts,
  useDashboardStore,
} from "@/lib/store/dashboard-store";

function formatTs(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

const SEVERITY_ICON = {
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  critical: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 9v4m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export function GuardrailAlerts() {
  const allAlerts = useDashboardStore((s) => s.alerts);
  const alerts = useMemo(() => filterGuardrailAlerts(allAlerts), [allAlerts]);

  if (alerts.length === 0) return null;

  return (
    <section
      className="panel overflow-hidden border border-[var(--accent)]/25 bg-gradient-to-br from-[var(--accent-dim)]/50 to-white animate-slide-in"
      aria-label="Guardrail alerts"
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-[var(--accent-strong)] via-[var(--accent)] to-[var(--accent-dim)]" />

      <header className="flex items-center gap-3 border-b border-[var(--accent)]/12 px-5 py-3.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-dim)] text-[var(--accent-strong)] ring-1 ring-[var(--accent)]/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="flex-1">
          <h2 className="font-display text-[15px] font-semibold text-[var(--text-primary)]">
            Guardrail alerts
          </h2>
          <p className="text-xs text-[var(--accent-strong)]">
            Deterministic rule — no LLM
          </p>
        </div>
        <span className="chip border border-[var(--accent)]/25 bg-[var(--accent-dim)] font-mono-data text-[var(--accent-strong)]">
          {alerts.length}
        </span>
      </header>

      <ul className="space-y-2 p-4">
        {alerts.slice(0, 5).map((alert) => (
          <li
            key={alert.id}
            className="panel-inset border-l-2 border-l-[var(--accent-strong)] px-4 py-3 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-[var(--accent-strong)]">
                {SEVERITY_ICON[alert.severity] ?? SEVERITY_ICON.warning}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                    {alert.title}
                  </p>
                  <time className="shrink-0 font-mono-data text-[10px] text-[var(--text-muted)]">
                    {formatTs(alert.ts)}
                  </time>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--text-muted)]">
                  {alert.summary}
                </p>
                {alert.recommendedAction === "pause" && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--accent-strong)]">
                      Auto-pause applied
                    </p>
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
