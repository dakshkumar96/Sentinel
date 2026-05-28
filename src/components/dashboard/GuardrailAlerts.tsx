"use client";

import { useMemo } from "react";
import {
  filterGuardrailAlerts,
  useDashboardStore,
} from "@/lib/store/dashboard-store";

export function GuardrailAlerts() {
  const allAlerts = useDashboardStore((s) => s.alerts);
  const alerts = useMemo(
    () => filterGuardrailAlerts(allAlerts),
    [allAlerts],
  );

  if (alerts.length === 0) return null;

  return (
    <section
      className="panel overflow-hidden border-[var(--purple)]/20 bg-[var(--bg-panel)]"
      aria-label="Guardrail alerts"
    >
      <header className="flex items-center gap-3 border-b border-[var(--border-subtle)] px-5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--guard-dim)] text-[var(--guard)]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div>
          <h2 className="font-display text-sm font-semibold text-[var(--text-primary)]">
            Guardrail fired
          </h2>
          <p className="text-xs text-[var(--guard)]">Deterministic · no LLM</p>
        </div>
      </header>
      <ul className="space-y-2 p-4">
        {alerts.slice(0, 5).map((alert) => (
          <li
            key={alert.id}
            className="panel-inset border-l-2 border-l-[var(--guard)] px-4 py-3"
          >
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {alert.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
              {alert.summary}
            </p>
            {alert.recommendedAction === "pause" && (
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--guard)]">
                Auto-pause applied
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
