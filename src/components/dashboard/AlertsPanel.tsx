"use client";

import { useShallow } from "zustand/react/shallow";
import type { Alert } from "@/types";
import {
  selectEscalationStats,
  selectOpenAlerts,
  useDashboardStore,
} from "@/lib/store/dashboard-store";

const severityBorder: Record<string, string> = {
  info: "border-l-[var(--accent)]",
  warning: "border-l-[var(--warm)]",
  critical: "border-l-[var(--danger)]",
};

function sourceChip(source: Alert["source"]) {
  if (source === "guardrail") {
    return "chip border border-[var(--guard)]/30 bg-[var(--guard-dim)] text-[var(--guard)]";
  }
  return "chip border border-[var(--agent)]/30 bg-[var(--agent-dim)] text-[var(--agent)]";
}

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
        className={`panel-inset w-full border-l-2 p-3 text-left transition ${
          severityBorder[alert.severity] ?? "border-l-[var(--border-strong)]"
        } ${selected ? "ring-1 ring-[var(--purple)]/40 bg-[var(--purple-dim)]" : "hover:bg-[var(--bg-hover)]"}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={sourceChip(alert.source)}>{alert.source}</span>
          {alert.requiresHuman && pending && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--warm)]">
              Needs you
            </span>
          )}
          {!alert.requiresHuman && alert.source === "agent" && (
            <span className="text-[10px] font-medium text-[var(--green)]">
              Logged
            </span>
          )}
        </div>
        <h3 className="mt-2 text-sm font-medium text-[var(--text-primary)]">
          {alert.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--text-muted)]">
          {alert.summary}
        </p>
        {resolved && (
          <p className="mt-2 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
            {alert.status.replace("_", " ")}
          </p>
        )}
      </button>

      {needsReview && (
        <button
          type="button"
          onClick={() => openGate(alert.id)}
          className="mt-2 w-full rounded-lg border border-[var(--warm)]/30 bg-[var(--warm-dim)] py-2 text-xs font-semibold text-[var(--warm)] transition hover:bg-[var(--warm)]/20"
        >
          Open approval gate →
        </button>
      )}
    </li>
  );
}

export function AlertsPanel() {
  const alerts = useDashboardStore((s) => s.alerts);
  const openAlerts = useDashboardStore(useShallow(selectOpenAlerts));
  const stats = useDashboardStore(useShallow(selectEscalationStats));
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
    <aside className="panel flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden">
      <header className="border-b border-[var(--border-subtle)] px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Inbox
        </p>
        <h2 className="font-display mt-0.5 text-base font-semibold text-[var(--text-primary)]">
          Alerts
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {stats.pending === 0
            ? `${stats.signals} signals · ${stats.escalations} escalations`
            : `${stats.pending} awaiting you · ${stats.signals} total`}
        </p>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-3">
        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
            Open
          </h3>
          <ul className="space-y-2">
            {openAlerts.length === 0 ? (
              <li className="panel-inset border-dashed py-8 text-center text-xs text-[var(--text-muted)]">
                All clear — run a scenario
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
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
              Resolved
            </h3>
            <ul className="space-y-2 opacity-75">
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
