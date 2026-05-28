"use client";

import { useEffect } from "react";
import type { Alert } from "@/types";
import {
  useActiveInvestigation,
  useDashboardStore,
} from "@/lib/store/dashboard-store";

function actionLabel(alert: Alert): string {
  if (alert.recommendedAction === "pause") return "pause placement";
  if (alert.recommendedAction === "scale_down") return "scale down";
  return "recommended action";
}

export function ApprovalGate() {
  const gateAlertId = useDashboardStore((s) => s.gateAlertId);
  const alerts = useDashboardStore((s) => s.alerts);
  const closeGate = useDashboardStore((s) => s.closeGate);
  const resolveAlert = useDashboardStore((s) => s.resolveAlert);
  const activeInvestigation = useActiveInvestigation();

  const alert = gateAlertId
    ? alerts.find((a) => a.id === gateAlertId)
    : undefined;

  const open = Boolean(alert?.requiresHuman && alert.status === "pending_human");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeGate]);

  if (!open || !alert) return null;

  const handleResolve = async (status: Parameters<typeof resolveAlert>[1]) => {
    await resolveAlert(alert.id, status);
    closeGate();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
        aria-label="Close approval gate"
        onClick={closeGate}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-[-12px_0_40px_rgba(28,25,23,0.12)]"
        role="dialog"
        aria-labelledby="approval-gate-title"
      >
        <div className="h-1 w-full bg-gradient-to-r from-[var(--warm)] via-[var(--warm)]/50 to-transparent" />

        <header className="border-b border-[var(--border-subtle)] px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--warm)]">
                Your call
              </p>
              <h2
                id="approval-gate-title"
                className="font-display mt-1 text-xl font-semibold text-[var(--text-primary)]"
              >
                {alert.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeGate}
              className="btn-ghost flex h-9 w-9 items-center justify-center p-0 text-lg"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            {alert.summary}
          </p>
          {alert.recommendedAction && alert.recommendedAction !== "none" && (
            <p className="mt-3 panel-inset px-3 py-2 text-xs text-[var(--warm)]">
              Agent recommends:{" "}
              <strong className="font-semibold">{actionLabel(alert)}</strong>
            </p>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {activeInvestigation && (
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Evidence
              </h3>
              <ul className="mt-3 space-y-2">
                {activeInvestigation.toolCalls.map((call, i) => (
                  <li
                    key={call.ts + call.tool}
                    className="panel-inset border-l-2 border-l-[var(--agent)] px-3 py-2.5"
                  >
                    <p className="text-xs font-medium text-[var(--agent)]">
                      {i + 1}. {call.tool.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                      {call.outputSummary}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                {activeInvestigation.reasoning}
              </p>
              <p className="mt-2 font-mono-data text-xs text-[var(--text-muted)]">
                {Math.round(activeInvestigation.confidence * 100)}% confidence ·{" "}
                {activeInvestigation.verdict}
              </p>
            </section>
          )}
        </div>

        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-inset)] p-6 space-y-2">
          <button
            type="button"
            onClick={() => handleResolve("approved")}
            className="btn-primary w-full py-3 text-sm"
          >
            Approve {alert.recommendedAction === "pause" ? "pause" : "action"}
          </button>
          <button
            type="button"
            onClick={() => handleResolve("overridden")}
            className="btn-ghost w-full py-3 text-sm font-medium"
          >
            Override — keep running
          </button>
          <button
            type="button"
            onClick={() => handleResolve("dismissed")}
            className="w-full py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          >
            Dismiss
          </button>
        </footer>
      </aside>
    </div>
  );
}
