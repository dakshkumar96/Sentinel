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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close approval gate"
        onClick={closeGate}
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl"
        role="dialog"
        aria-labelledby="approval-gate-title"
      >
        <header className="border-b border-zinc-800 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-400">
                Human approval required
              </p>
              <h2
                id="approval-gate-title"
                className="mt-1 text-lg font-semibold text-zinc-100"
              >
                {alert.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeGate}
              className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            {alert.summary}
          </p>
          {alert.recommendedAction && alert.recommendedAction !== "none" && (
            <p className="mt-2 text-xs text-amber-400/90">
              Agent recommends: <strong>{actionLabel(alert)}</strong>
            </p>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeInvestigation && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Evidence
              </h3>
              <ul className="mt-2 space-y-2">
                {activeInvestigation.toolCalls.map((call) => (
                  <li
                    key={call.ts + call.tool}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2"
                  >
                    <p className="text-xs font-medium text-sky-300">
                      {call.tool.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {call.outputSummary}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-zinc-300">
                {activeInvestigation.reasoning}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Confidence{" "}
                <span className="tabular-nums text-zinc-300">
                  {Math.round(activeInvestigation.confidence * 100)}%
                </span>
                {" · "}
                Verdict{" "}
                <span className="uppercase text-zinc-300">
                  {activeInvestigation.verdict}
                </span>
              </p>
            </section>
          )}
        </div>

        <footer className="border-t border-zinc-800 p-5 space-y-2">
          <button
            type="button"
            onClick={() => handleResolve("approved")}
            className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Approve {alert.recommendedAction === "pause" ? "pause" : "action"}
          </button>
          <button
            type="button"
            onClick={() => handleResolve("overridden")}
            className="w-full rounded-lg border border-zinc-600 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
          >
            Override — keep running
          </button>
          <button
            type="button"
            onClick={() => handleResolve("dismissed")}
            className="w-full rounded-lg py-2 text-sm text-zinc-500 hover:text-zinc-300"
          >
            Dismiss
          </button>
        </footer>
      </aside>
    </div>
  );
}
