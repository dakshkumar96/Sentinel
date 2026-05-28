"use client";

import { useShallow } from "zustand/react/shallow";
import { selectGuardrailAlerts, useDashboardStore } from "@/lib/store/dashboard-store";

export function GuardrailAlerts() {
  const alerts = useDashboardStore(useShallow(selectGuardrailAlerts));

  if (alerts.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-red-500/40 bg-red-950/40 p-4"
      aria-label="Guardrail alerts"
    >
      <header className="mb-3 flex items-center gap-2">
        <span className="flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <h2 className="text-sm font-semibold text-red-300">
          Guardrail — instant action
        </h2>
        <span className="text-xs text-red-400/80">No agent / no LLM</span>
      </header>
      <ul className="space-y-2">
        {alerts.slice(0, 5).map((alert) => (
          <li
            key={alert.id}
            className="rounded-lg border border-red-500/25 bg-zinc-950/50 px-3 py-2"
          >
            <p className="text-sm font-medium text-red-200">{alert.title}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{alert.summary}</p>
            {alert.recommendedAction === "pause" && (
              <p className="mt-1 text-xs font-medium text-red-400">
                Auto-pause applied
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
