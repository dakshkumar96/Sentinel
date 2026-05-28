"use client";

import type { Alert } from "@/types";
import {
  selectEscalationStats,
  selectOpenAlerts,
  useDashboardStore,
} from "@/lib/store/dashboard-store";

const severityStyles: Record<string, string> = {
  info: "border-zinc-700 bg-zinc-900/80",
  warning: "border-amber-500/40 bg-amber-500/5",
  critical: "border-red-500/50 bg-red-500/10",
};

const sourceBadge: Record<string, string> = {
  guardrail: "bg-violet-500/20 text-violet-300",
  agent: "bg-sky-500/20 text-sky-300",
};

function AlertRow({
  alert,
  selected,
  onSelect,
}: {
  alert: Alert;
  selected: boolean;
  onSelect: () => void;
}) {
  const openGate = useDashboardStore((s) => s.openGate);
  const pending =
    alert.status === "pending_human" ||
    (alert.status === "open" && alert.requiresHuman);
  const needsReview =
    pending && alert.requiresHuman && alert.source === "agent";
  const resolved = ["approved", "resolved", "overridden", "dismissed"].includes(
    alert.status,
  );

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-lg border p-3 text-left transition ${
          severityStyles[alert.severity]
        } ${selected ? "ring-1 ring-sky-500/50" : "hover:border-zinc-600"} ${
          pending && alert.severity === "critical" ? "animate-pulse" : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${sourceBadge[alert.source]}`}
          >
            {alert.source}
          </span>
          {alert.requiresHuman && pending && (
            <span className="text-[10px] font-medium uppercase text-amber-400">
              Needs approval
            </span>
          )}
          {!alert.requiresHuman && alert.source === "agent" && (
            <span className="text-[10px] font-medium uppercase text-emerald-500/90">
              Auto-logged
            </span>
          )}
          {alert.source === "guardrail" && (
            <span className="text-[10px] font-medium uppercase text-violet-400/90">
              No LLM
            </span>
          )}
        </div>
        <h3 className="mt-2 text-sm font-medium text-zinc-100">{alert.title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">
          {alert.summary}
        </p>
        {resolved && (
          <p className="mt-2 text-[10px] uppercase tracking-wide text-zinc-600">
            {alert.status.replace("_", " ")}
          </p>
        )}
      </button>

      {needsReview && (
        <button
          type="button"
          onClick={() => openGate(alert.id)}
          className="mt-2 w-full rounded-md border border-amber-500/40 bg-amber-500/10 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
        >
          Review in approval gate →
        </button>
      )}
    </li>
  );
}

export function AlertsPanel() {
  const alerts = useDashboardStore((s) => s.alerts);
  const openAlerts = useDashboardStore(selectOpenAlerts);
  const stats = useDashboardStore(selectEscalationStats);
  const activeInvestigationId = useDashboardStore((s) => s.activeInvestigationId);
  const gateAlertId = useDashboardStore((s) => s.gateAlertId);
  const selectInvestigation = useDashboardStore((s) => s.selectInvestigation);
  const openGate = useDashboardStore((s) => s.openGate);

  const resolved = alerts.filter(
    (a) => !openAlerts.some((o) => o.id === a.id),
  );

  const handleSelect = (alert: Alert) => {
    if (alert.investigationId) {
      selectInvestigation(alert.investigationId);
    }
    if (
      alert.status === "pending_human" &&
      alert.requiresHuman &&
      alert.source === "agent"
    ) {
      openGate(alert.id);
    }
  };

  return (
    <aside className="flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-zinc-800 bg-zinc-900/50">
      <header className="border-b border-zinc-800 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-200">Alerts</h2>
        <p className="mt-1 text-xs text-zinc-500">
          {stats.pending === 0
            ? `${stats.signals} signals · ${stats.escalations} escalations`
            : `${stats.pending} need approval · ${stats.signals} total`}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Open
          </h3>
          <ul className="space-y-2">
            {openAlerts.length === 0 ? (
              <li className="rounded-lg border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-600">
                All clear — run a demo scenario
              </li>
            ) : (
              openAlerts.map((a) => (
                <AlertRow
                  key={a.id}
                  alert={a}
                  selected={
                    a.investigationId === activeInvestigationId ||
                    a.id === gateAlertId
                  }
                  onSelect={() => handleSelect(a)}
                />
              ))
            )}
          </ul>
        </section>

        {resolved.length > 0 && (
          <section>
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              Resolved / logged
            </h3>
            <ul className="space-y-2 opacity-80">
              {resolved.slice(0, 8).map((a) => (
                <AlertRow
                  key={a.id}
                  alert={a}
                  selected={a.investigationId === activeInvestigationId}
                  onSelect={() => handleSelect(a)}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  );
}
