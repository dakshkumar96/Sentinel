"use client";

import { useDashboardStore } from "@/lib/store/dashboard-store";

export function AgentWatchBanner() {
  const agentEngine = useDashboardStore((s) => s.agentEngine);
  const connected = useDashboardStore((s) => s.connected);
  const investigating = useDashboardStore((s) => s.investigating);
  const activeInvestigationId = useDashboardStore((s) => s.activeInvestigationId);

  const isClaude = agentEngine === "claude";
  const hasResult = Boolean(activeInvestigationId) && !investigating;

  const statusText = investigating
    ? "investigating anomaly…"
    : hasResult
      ? "verdict ready"
      : connected
        ? "watching live feed"
        : "connecting…";

  const subText = investigating
    ? "Running tool loop — gathering evidence before deciding."
    : "Monitoring spend velocity, conversions, and conversation context.";

  return (
    <section
      className="relative overflow-hidden rounded-[18px] border border-[var(--agent)]/12 bg-gradient-to-br from-[var(--agent-dim)]/70 via-white to-white"
      aria-label="Agent status"
      style={{ boxShadow: "var(--shadow-panel)" }}
    >
      <div className="card-shimmer card-shimmer-blue" />

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-300 ${
              investigating
                ? "bg-[var(--agent-dim)] ring-[var(--agent)]/35"
                : isClaude
                  ? "bg-[var(--agent-dim)] ring-[var(--agent)]/25"
                  : "bg-[var(--bg-inset)] ring-[var(--border-strong)]"
            }`}
          >
            {(investigating || connected) && (
              <span
                className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${
                  investigating
                    ? "bg-[var(--agent)] live-dot"
                    : "bg-[var(--green)] live-dot"
                }`}
              />
            )}

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className={
                investigating
                  ? "text-[var(--agent)]"
                  : isClaude
                    ? "text-[var(--agent)]"
                    : "text-[var(--text-muted)]"
              }
              aria-hidden
            >
              {investigating ? (
                <>
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="animate-spin"
                    style={{ transformOrigin: "center" }}
                  />
                  <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </>
              ) : (
                <>
                  <path
                    d="M12 3a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V7a4 4 0 0 1 4-4z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="9" cy="12" r="1" fill="currentColor" />
                  <circle cx="15" cy="12" r="1" fill="currentColor" />
                </>
              )}
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Agent engine
            </p>
            <h2 className="font-display mt-0.5 text-[17px] font-semibold text-[var(--text-primary)]">
              {isClaude ? "Claude Sonnet" : "Mock agent"}{" "}
              <span className="font-normal text-[var(--text-muted)]">· {statusText}</span>
            </h2>
            <p className="mt-0.5 truncate text-[13px] text-[var(--text-secondary)]">
              {subText}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="chip border border-[var(--agent)]/20 bg-[var(--agent-dim)] text-[var(--agent)]">
            Auto-investigate
          </span>
          <span className="chip border border-[var(--border-subtle)] bg-[var(--bg-inset)] text-[var(--text-muted)]">
            Escalate when uncertain
          </span>
          {isClaude && (
            <span className="chip border border-[var(--green)]/25 bg-[var(--green-dim)] text-[var(--green)]">
              Live Claude API
            </span>
          )}
        </div>
      </div>

      {investigating && (
        <div className="h-0.5 w-full overflow-hidden bg-[var(--bg-inset)]">
          <div className="h-full w-1/3 animate-progress-bar bg-gradient-to-r from-transparent via-[var(--agent)] to-transparent" />
        </div>
      )}
    </section>
  );
}
