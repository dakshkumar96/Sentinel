"use client";

import { useEffect } from "react";
import type { Alert } from "@/types";
import {
  useActiveInvestigation,
  useDashboardStore,
} from "@/lib/store/dashboard-store";

const TOOL_LABELS: Record<string, string> = {
  get_conversion_trend: "Conversion trend",
  get_conversation_context: "Conversation context",
  get_brand_guidelines: "Brand guidelines",
  get_historical_baseline: "Historical baseline",
  get_client_context: "Client context",
};

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

  const alert = gateAlertId ? alerts.find((a) => a.id === gateAlertId) : undefined;
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

  const confidence = activeInvestigation
    ? Math.round(activeInvestigation.confidence * 100)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-[2px]"
        aria-label="Close approval gate"
        onClick={closeGate}
      />
      <aside
        className="relative flex h-full w-full max-w-[420px] flex-col border-l border-[var(--border-strong)] bg-white"
        style={{ boxShadow: "-16px 0 48px rgba(15, 23, 42, 0.12)" }}
        role="dialog"
        aria-labelledby="approval-gate-title"
      >
        <div className="h-[3px] w-full bg-gradient-to-r from-[var(--warm)] via-[var(--warm)]/60 to-transparent" />

        <header className="border-b border-[var(--border-subtle)] px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--warm)]">
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
              className="btn-ghost flex h-9 w-9 items-center justify-center p-0 text-lg text-[var(--text-muted)]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
            {alert.summary}
          </p>
          {alert.recommendedAction && alert.recommendedAction !== "none" && (
            <div className="mt-3 rounded-xl border border-[var(--warm)]/20 bg-[var(--warm-dim)] px-3 py-2.5 text-[12px] text-[var(--warm)]">
              Agent recommends:{" "}
              <strong className="font-semibold">{actionLabel(alert)}</strong>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {activeInvestigation && (
            <section>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Evidence
              </h3>
              <ul className="mt-3 space-y-2">
                {activeInvestigation.toolCalls.map((call) => (
                  <li
                    key={call.ts + call.tool}
                    className="rounded-xl border border-[var(--border-subtle)] border-l-[3px] border-l-[var(--agent)] bg-[var(--bg-inset)]/50 px-3 py-2.5"
                  >
                    <p className="text-[11px] font-semibold text-[var(--agent)]">
                      {TOOL_LABELS[call.tool] ?? call.tool.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--text-muted)]">
                      {call.outputSummary}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                {activeInvestigation.reasoning}
              </p>
              {confidence !== null && (
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    <span>Confidence</span>
                    <span className="font-mono-data">{confidence}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-inset)]">
                    <div
                      className="h-full rounded-full bg-[var(--agent)] transition-all duration-500"
                      style={{ width: `${confidence}%` }}
                    />
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-inset)]/40 p-6 space-y-2">
          <button
            type="button"
            onClick={() => handleResolve("approved")}
            className="btn-primary w-full py-3 text-[13px]"
          >
            Approve {alert.recommendedAction === "pause" ? "pause" : "action"}
          </button>
          <button
            type="button"
            onClick={() => handleResolve("overridden")}
            className="btn-ghost w-full py-3 text-[13px] font-medium"
          >
            Override — keep running
          </button>
          <button
            type="button"
            onClick={() => handleResolve("dismissed")}
            className="w-full py-2 text-[13px] text-[var(--text-muted)] transition hover:text-[var(--text-secondary)]"
          >
            Dismiss
          </button>
        </footer>
      </aside>
    </div>
  );
}
