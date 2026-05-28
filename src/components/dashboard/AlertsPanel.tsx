"use client";

import type { Alert } from "@/types";
import { useDashboardStore } from "@/lib/store/dashboard-store";

const severityStyles: Record<string, string> = {
  info: "border-zinc-700 bg-zinc-900",
  warning: "border-amber-500/40 bg-amber-500/5",
  critical: "border-red-500/50 bg-red-500/10",
};

const sourceBadge: Record<string, string> = {
  guardrail: "bg-violet-500/20 text-violet-300",
  agent: "bg-sky-500/20 text-sky-300",
};

function AlertRow({ alert }: { alert: Alert }) {
  const resolveAlert = useDashboardStore((s) => s.resolveAlert);
  const pending = alert.status === "pending_human" || alert.status === "open";
  const resolved = ["approved", "resolved", "dismissed", "overridden"].includes(
    alert.status,
  );

  return (
    <li
      className={`rounded-lg border p-3 ${severityStyles[alert.severity]} ${pending && alert.severity === "critical" ? "animate-pulse" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${sourceBadge[alert.source]}`}
        >
          {alert.source}
        </span>
        {alert.requiresHuman && pending && (
          <span className="text-[10px] font-medium uppercase text-amber-400">
            Needs you
          </span>
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-zinc-100">{alert.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-400">{alert.summary}</p>

      {pending && alert.requiresHuman && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => resolveAlert(alert.id, "approved")}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
          >
            Approve pause
          </button>
          <button
            type="button"
            onClick={() => resolveAlert(alert.id, "overridden")}
            className="rounded-md border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Override
          </button>
          <button
            type="button"
            onClick={() => resolveAlert(alert.id, "dismissed")}
            className="rounded-md px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {resolved && (
        <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-600">
          {alert.status}
        </p>
      )}
    </li>
  );
}

export function AlertsPanel() {
  const alerts = useDashboardStore((s) => s.alerts);
  const openCount = alerts.filter(
    (a) => a.status === "pending_human" || a.status === "open",
  ).length;

  return (
    <aside className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900/50">
      <header className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-200">Alerts</h2>
        <p className="text-xs text-zinc-500">
          {openCount === 0
            ? "All clear — monitoring live spend"
            : `${openCount} need attention`}
        </p>
      </header>
      <ul className="flex-1 space-y-2 overflow-y-auto p-3">
        {alerts.length === 0 ? (
          <li className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-600">
            No alerts yet. Use demo scenarios to simulate events.
          </li>
        ) : (
          alerts.map((a) => <AlertRow key={a.id} alert={a} />)
        )}
      </ul>
    </aside>
  );
}
